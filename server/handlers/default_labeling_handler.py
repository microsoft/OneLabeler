import json
from typing import List

from bson.objectid import ObjectId
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

from .utils.data_persistence import is_saved, load, save


def load_model(model) -> BaseEstimator:
    model_type = model['type']
    model_id = model['objectId']

    assert model_type in [
        'DecisionTree',
        'SVM',
        'LogisticRegression',
        'RestrictedBoltzmannMachine',
        'LabelSpreading',
    ]

    if is_saved(model_id):
        model = load(inserted_id=ObjectId(model_id))
    else:
        if model_type == 'DecisionTree':
            model = DecisionTreeClassifier()
        if model_type == 'SVM':
            model = SVC(gamma=0.001)
        if model_type == 'LogisticRegression':
            model = make_pipeline(
                StandardScaler(),
                LogisticRegression(C=1, penalty='l2',
                                   tol=0.01, solver='saga'),
            )
        if model_type == 'LabelSpreading':
            model = LabelSpreading(gamma=0.25, max_iter=20)
        if model_type == 'RestrictedBoltzmannMachine':
            model = make_pipeline(
                BernoulliRBM(random_state=0),
                LogisticRegression(solver='newton-cg', tol=1),
            )
        details = save(data=model, inserted_id=ObjectId(model_id))
    return model


def default_label_null(unlabeled_mark: str,
                       n_samples: int) -> np.ndarray:
    return np.array([unlabeled_mark
                     for i in range(n_samples)], dtype=str)


def default_label_random(classes: List[str],
                         n_samples: int) -> np.ndarray:
    return np.random.choice(classes, size=n_samples, replace=True)


class DefaultLabelingHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        assert key in ['Null', 'Random', 'ModelPrediction']

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
        features = np.array([data_object['features']
                             for data_object in data_objects])
        n_samples = len(features)

        if key == 'Null':
            labels = default_label_null(unlabeled_mark, n_samples)
        if key == 'Random':
            labels = default_label_random(classes, n_samples)
        if key == 'ModelPrediction':
            predictor = load_model(model)
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

        self.write({'labels': labels})
