from typing import List

import numpy as np
from sklearn.exceptions import NotFittedError

from ..utils.data_labeling.types import Label, Model
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
        n_samples = len(features)
        if categories is not None and len(categories) != 0:
            return default_label_random(uuids, categories, n_samples)
        elif unlabeled_mark is not None:
            return default_label_null(uuids, unlabeled_mark, n_samples)
        raise ValueError(
            'Model not fitted, categories and unlabeled mark not provided')
