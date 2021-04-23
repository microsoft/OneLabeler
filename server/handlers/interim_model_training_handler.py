import json

from bson.objectid import ObjectId
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.semi_supervised import LabelSpreading
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import tornado.web

from .utils.data_persistence import is_saved, load, save
from .utils.data_labeling.types import BuiltInModelType, Status


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
        save(data=estimator, inserted_id=ObjectId(estimator_id))
    return estimator


def update_estimator(estimator_type: str,
                     estimator: BaseEstimator,
                     features: np.ndarray,
                     labels: np.ndarray,
                     statuses: np.ndarray) -> BaseEstimator:
    assert len(features) == len(labels),\
        f'number of data objects and labels mismatch: {len(features)} != {len(labels)}'
    assert len(features) == len(statuses),\
        f'number of data objects and label statuses mismatch: {len(features)} != {len(statuses)}'
    assert estimator_type in [
        BuiltInModelType.Null,
        BuiltInModelType.Random,
        BuiltInModelType.DecisionTree,
        BuiltInModelType.SVM,
        BuiltInModelType.LogisticRegression,
        BuiltInModelType.LabelSpreading,
        BuiltInModelType.RestrictedBoltzmannMachine,
    ], f'Invalid model type: {estimator_type}'

    mask_labeled = np.array([status == Status.Labeled
                             for status in statuses])
    if np.sum(mask_labeled) == 0:
        return estimator

    X = features

    unlabeled_indices = np.where(~mask_labeled)[0]
    if len(unlabeled_indices) != 0:
        unlabeled_mark = labels[unlabeled_indices[0]]
        classes = np.array([d for d in np.unique(labels)
                            if d != unlabeled_mark])
        encoder = LabelEncoder().fit(classes)
        y = np.zeros(len(labels), dtype=int)
        y[mask_labeled] = encoder.transform(labels[mask_labeled])
        y[~mask_labeled] = -1
    else:
        classes = np.unique(y)
        encoder = LabelEncoder().fit(classes)
        y = encoder.transform(labels)

    X_train = X[mask_labeled]
    y_train = y[mask_labeled]

    if estimator_type in [BuiltInModelType.Null,
                          BuiltInModelType.Random]:
        pass
    elif estimator_type == BuiltInModelType.DecisionTree:
        estimator = DecisionTreeClassifier().fit(X_train, y_train)
        estimator = EstimatorWithLabelDecoder(
            estimator=estimator, encoder=encoder)
    elif estimator_type == BuiltInModelType.SVM:
        # sklearn.svm.SVC doesn't support the edge case with one class
        is_one_class = len(np.unique(y_train)) == 1
        estimator = SVC(gamma=0.001) if not is_one_class\
            else DummyClassifier(strategy='most_frequent')
        estimator = estimator.fit(X_train, y_train)
        estimator = EstimatorWithLabelDecoder(
            estimator=estimator, encoder=encoder)
    elif estimator_type == BuiltInModelType.LogisticRegression:
        # sklearn.linear_model.LogisticRegression
        # doesn't support the edge case with one class
        is_one_class = len(np.unique(y_train)) == 1
        estimator = make_pipeline(
            StandardScaler(),
            LogisticRegression(C=1, penalty='l2', tol=0.01, solver='saga'),
        ) if not is_one_class else DummyClassifier(strategy='most_frequent')
        estimator = estimator.fit(X_train, y_train)
        estimator = EstimatorWithLabelDecoder(
            estimator=estimator, encoder=encoder)
    elif estimator_type == BuiltInModelType.RestrictedBoltzmannMachine:
        # sklearn.neural_network.BernoulliRBM
        # doesn't support the edge case with one class
        is_one_class = len(np.unique(y_train)) == 1
        estimator = make_pipeline(
            BernoulliRBM(random_state=0),
            LogisticRegression(solver='newton-cg', tol=1),
        ) if not is_one_class else DummyClassifier(strategy='most_frequent')
        estimator = estimator.fit(X_train, y_train)
        estimator = EstimatorWithLabelDecoder(
            estimator=estimator, encoder=encoder)
    elif estimator_type == BuiltInModelType.LabelSpreading:
        estimator = LabelSpreading(gamma=0.25, max_iter=20)\
            if estimator is None else estimator
        estimator = estimator.fit(X, y)
        estimator = EstimatorWithLabelDecoder(
            estimator=estimator, encoder=encoder)
    return estimator


class EstimatorWithLabelDecoder(BaseEstimator):
    def __init__(self, estimator: BaseEstimator, encoder: LabelEncoder):
        self.estimator = estimator
        self.encoder = encoder

    def predict(self, X: np.ndarray) -> np.ndarray:
        # pylint: disable=invalid-name

        y_pred = self.estimator.predict(X)
        y_pred_decoded = self.encoder.inverse_transform(y_pred)
        return y_pred_decoded

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        # pylint: disable=invalid-name

        proba = self.estimator.predict_proba(X)
        return proba


class InterimModelTrainingHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        assert key in ['Retrain']

        # process input: (features, labels, model?)
        data_objects = json_data['dataObjects']
        labels = json_data['labels']
        statuses = json_data['statuses']
        model = json_data['model']

        # data structure transformation
        features = np.array([data_object['features']
                             for data_object in data_objects])
        labels = np.array(labels, dtype=str)
        statuses = np.array(statuses, dtype=str)
        estimator = load_estimator(model)

        estimator = update_estimator(model['type'], estimator,
                                     features, labels, statuses)
        
        save(data=estimator, inserted_id=ObjectId(model['objectId']))
        self.write({'model': model})