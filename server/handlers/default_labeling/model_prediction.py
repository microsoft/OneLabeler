# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json
from typing import List

import numpy as np
from sklearn.exceptions import NotFittedError
from tornado.web import RequestHandler

from ..types import DataObject, Label, Model
from ..utils.load_estimator import load_estimator

from .null import get_default_label as default_label_null
from .random import get_default_label as default_label_random

def get_default_label(model: Model,
                      features: np.ndarray,
                      uuids: List[str],
                      categories: List[str],
                      unlabeled_mark: str) -> List[Label]:
    predictor = load_estimator(model)
    try:
        labels = predictor.predict(features).tolist()
        labels = [
            {'category': d, 'uuid': uuids[i]}
            for i, d in enumerate(labels)
        ]
        return labels
    except NotFittedError:
        print('model not fitted')
        if categories is not None and len(categories) != 0:
            return default_label_random(uuids, categories)
        elif unlabeled_mark is not None:
            return default_label_null(uuids, unlabeled_mark)
        raise ValueError(
            'Model not fitted, categories and unlabeled mark not provided')

class Handler(RequestHandler):
    """
    The handler for default labeling - model prediction.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # input: (dataObjects, features, model, categories, unlabeledMark)
        data_objects: List[DataObject] = json_data['dataObjects']
        uuids = [(d['uuid'] if 'uuid' in d else None) for d in data_objects]
        features = np.array([(d['features'] if 'features' in d else None)
                             for d in data_objects])
        model: Model = json_data['model']
        categories: List[str] = json_data['categories']
        unlabeled_mark: str = json_data['unlabeledMark']
        
        labels = get_default_label(
            model, features, uuids, categories, unlabeled_mark)

        self.write({'labels': labels})

