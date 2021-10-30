import json
from typing import List
import uuid

from bson.objectid import ObjectId
import nltk
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.semi_supervised import LabelSpreading
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import tornado.web
import torch

from .utils.data_persistence import is_saved, load, save
from .utils.pointnet import PointNetSeg


def load_estimator(model) -> BaseEstimator:
    estimator_type = model['type']
    estimator_id = model['objectId']

    assert estimator_type in [
        'DecisionTree',
        'SVM',
        'LogisticRegression',
        'RestrictedBoltzmannMachine',
        'LabelSpreading',
    ]

    if is_saved(inserted_id=ObjectId(estimator_id)):
        estimator = load(inserted_id=ObjectId(estimator_id))
    else:
        if estimator_type == 'DecisionTree':
            estimator = DecisionTreeClassifier()
        if estimator_type == 'SVM':
            estimator = SVC(gamma=0.001)
        if estimator_type == 'LogisticRegression':
            estimator = make_pipeline(
                StandardScaler(),
                LogisticRegression(C=1, penalty='l2',
                                   tol=0.01, solver='saga'),
            )
        if estimator_type == 'LabelSpreading':
            estimator = LabelSpreading(gamma=0.25, max_iter=20)
        if estimator_type == 'RestrictedBoltzmannMachine':
            estimator = make_pipeline(
                BernoulliRBM(random_state=0),
                LogisticRegression(solver='newton-cg', tol=1),
            )
        details = save(data=estimator,
                       inserted_id=ObjectId(estimator_id))
    return estimator


def default_label_null(unlabeled_mark: str,
                       n_samples: int) -> np.ndarray:
    return np.array([unlabeled_mark
                     for i in range(n_samples)], dtype=str)


def default_label_random(classes: List[str],
                         n_samples: int) -> np.ndarray:
    return np.random.choice(classes, size=n_samples, replace=True)


def default_label_pos_tag(sentence: str) -> List[dict]:
    pos_tag = nltk.pos_tag(sentence.split())
    start = 0
    end = 0
    spans = []
    for i, (segment, tag) in enumerate(pos_tag):
        start = end + 1 if i != 0 else end
        end = start + len(segment)
        if tag != 'CD':
            continue
        spans.append({
            'text': segment,
            'start': start,
            'end': end,
            'category': tag,
            'uuid': str(uuid.uuid4()),
        })
    return spans


def default_label_pos_tag_value(sentence: str) -> List[dict]:
    pos_tag = nltk.pos_tag(sentence.split())
    start = 0
    end = 0
    spans = []
    for i, (segment, tag) in enumerate(pos_tag):
        start = end + 1 if i != 0 else end
        end = start + len(segment)
        if tag != 'CD':
            continue
        spans.append({
            'text': segment,
            'start': start,
            'end': end,
            'category': 'value',
            'uuid': str(uuid.uuid4()),
        })
    return spans

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
pointnet = PointNetSeg()

# Note: the pretrained model is for airplane segmentation with 4 classes
# 0: wing, 1: body, 2: tail, 3: engine
path = './handlers/utils/pointnet/seg_model'
pointnet.load_state_dict(torch.load(path, map_location=device))

def default_label_pointnet_seg(batch: List) -> np.ndarray:
    """
    For each data object (i.e., point cloud),
    get a list of labels corresponding to point segmentation labels
    """

    # TODO: the current model only allow batch size > 1
    # need to figure out why this restriction exists

    pred = pointnet(torch.tensor(batch).transpose(1, 2))
    pred_np = np.array(torch.argmax(pred[0], 1))
    return pred_np


class DefaultLabelingHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        if key not in ['Null', 'Random', 'ModelPrediction', 'POS-tagging', 'PointNet-segmentation']:
            # The service is not found.
            self.send_error(404)
            return

        # process input: (dataObjects, model, classes?, unlabeledMark?)
        # note: classes are required to be strings
        data_objects = json_data['dataObjects']
        model = json_data['model']\
            if 'model' in json_data else None
        classes = np.array(json_data['classes'], dtype=str)\
            if 'classes' in json_data else None
        unlabeled_mark = json_data['unlabeledMark']\
            if 'unlabeledMark' in json_data else None

        # data structure transformation
        features = np.array([(d['features'] if 'features' in d else None)
                             for d in data_objects])
        n_samples = len(features)

        if key == 'Null':
            labels = default_label_null(unlabeled_mark, n_samples)
            labels = labels.tolist()
            labels = [{'category': d} for d in labels]
        if key == 'Random':
            labels = default_label_random(classes, n_samples)
            labels = labels.tolist()
            labels = [{'category': d} for d in labels]
        if key == 'ModelPrediction':
            predictor = load_estimator(model)
            try:
                labels = predictor.predict(features)
            except NotFittedError:
                if classes is not None and len(classes) != 0:
                    labels = default_label_random(classes, n_samples)
                elif unlabeled_mark is not None:
                    labels = default_label_null(unlabeled_mark, n_samples)
                else:
                    labels = None
            if labels is not None:
                labels = labels.tolist()
                labels = [{'category': d} for d in labels]
        if key == 'POS-tagging':
            labels = [default_label_pos_tag_value(d['content'])
                      for d in data_objects]
            # labels = [default_label_pos_tag(d['content']) for d in data_objects]
            labels = [{'spans': d} for d in labels]
        if key == 'PointNet-segmentation':
            points = [data_object['content'] for data_object in data_objects]
            labels = default_label_pointnet_seg(points)
            if labels is not None:
                labels = labels.tolist()
            labels = [{'pointLabels': d} for d in labels]

        self.write({'labels': labels})
