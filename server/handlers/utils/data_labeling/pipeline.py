"""
The instantiation of data labeling pipeline components.
"""

from copy import deepcopy
from typing import Any, List, Optional, Tuple, Union

import cv2 as cv
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.dummy import DummyClassifier
from sklearn.exceptions import NotFittedError
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import BernoulliRBM
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.semi_supervised import LabelSpreading
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier

from .feature_extraction import (raw_flatten,
                                 resize_SVD,
                                 resize_LDA,
                                 color_descriptors,
                                 edge_descriptors,
                                 edge_direction_descriptors,
                                 texture_descriptors)
from .generic import GenericPipeline
from .sampling import (random_sampling,
                       cluster_sampling,
                       cluster_centroid_sampling,
                       density_sampling,
                       entropy_sampling,
                       confidence_sampling,
                       margin_sampling)
from .types import (BuiltInModelType,
                    Label,
                    Model,
                    SamplingStrategyType,
                    Status)

ListLike = Union[List[Any], np.ndarray]


class DataLabelingPipeline(GenericPipeline):
    """
    The data labeling pipeline class.
    """

    @staticmethod
    def sample_data_objects(data_objects: ListLike,
                            labels: np.ndarray,
                            statuses: np.ndarray,
                            n_batch: int,
                            model: Model) -> np.ndarray:
        assert len(data_objects) == len(statuses),\
            'number of data objects and label statuses mismatch'

        if model.sampling_strategy == SamplingStrategyType.Random:
            query_indices = random_sampling(data_objects, statuses, n_batch)
        elif model.sampling_strategy == SamplingStrategyType.Cluster:
            query_indices = cluster_sampling(data_objects, statuses, n_batch)
        elif model.sampling_strategy == SamplingStrategyType.DenseAreas:
            query_indices = density_sampling(data_objects, statuses, n_batch)
        elif model.sampling_strategy == SamplingStrategyType.ClusterCentroids:
            query_indices = cluster_centroid_sampling(
                data_objects, statuses, n_batch)
        elif model.sampling_strategy == SamplingStrategyType.Entropy:
            query_indices = entropy_sampling(
                data_objects, statuses, n_batch, model.predictor)
        elif model.sampling_strategy == SamplingStrategyType.LeastConfident:
            query_indices = confidence_sampling(
                data_objects, statuses, n_batch, model.predictor)
        elif model.sampling_strategy == SamplingStrategyType.SmallestMargin:
            query_indices = margin_sampling(
                data_objects, statuses, n_batch, model.predictor)
        else:
            raise ValueError(
                f'Invalid sampling strategy: {model.sampling_strategy}')
        return query_indices
