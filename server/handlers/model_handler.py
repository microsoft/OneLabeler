import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.semi_supervised import LabelSpreading
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
import tornado.web

from .utils.data_persistence import is_saved, save


class ModelHandler(tornado.web.RequestHandler):
    """
    The handler for machine learned model.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')

        method, model_id = key.split('/', 1)

        assert method in [
            'DecisionTree',
            'SVM',
            'LogisticRegression',
            'RestrictedBoltzmannMachine',
            'LabelSpreading',
        ]

        if is_saved(model_id):
            pass
        else:
            if method === 'DecisionTree':
                model = DecisionTreeClassifier()
            if method === 'SVM':
                model = SVC(gamma=0.001)
            if method === 'LogisticRegression':
                model = make_pipeline(
                    StandardScaler(),
                    LogisticRegression(C=1, penalty='l2',
                                       tol=0.01, solver='saga'),
                )
            if method === 'LabelSpreading':
                model = LabelSpreading(gamma=0.25, max_iter=20)
            if method === 'RestrictedBoltzmannMachine':
                model = make_pipeline(
                    BernoulliRBM(random_state=0),
                    LogisticRegression(solver='newton-cg', tol=1),
                )

            details = save(data=model, inserted_id=model_id)


        self.write({ 'labels': labels })
