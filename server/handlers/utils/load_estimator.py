from bson.objectid import ObjectId
from sklearn.base import BaseEstimator
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.semi_supervised import LabelSpreading
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from .data_persistence import is_saved, load, save
from ..types import Model

def load_estimator(model: Model) -> BaseEstimator:
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
