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
from .types import (DefaultLabelingMethodType,
                    Label,
                    Model,
                    SamplingStrategyType,
                    Status)

ListLike = Union[List[Any], np.ndarray]


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

    @staticmethod
    def update_model(data_objects: ListLike,
                     labels: np.ndarray,
                     statuses: np.ndarray,
                     model: Model) -> Model:
        """
        Args
        ----
        labels : np.ndarray of string values
        """
        # pylint: disable=invalid-name

        assert len(data_objects) == len(labels),\
            f'number of data objects and labels mismatch: {len(data_objects)} != {len(labels)}'
        assert len(data_objects) == len(statuses),\
            f'number of data objects and label statuses mismatch: {len(data_objects)} != {len(statuses)}'

        assert model.type in [
            DefaultLabelingMethodType.Null,
            DefaultLabelingMethodType.Random,
            DefaultLabelingMethodType.DecisionTree,
            DefaultLabelingMethodType.SVM,
            DefaultLabelingMethodType.LogisticRegression,
            DefaultLabelingMethodType.LabelSpreading,
            DefaultLabelingMethodType.RestrictedBoltzmannMachine,
        ], f'Invalid model type: {model.type}'

        X = np.array([data_object['features'] for data_object in data_objects])
        mask_labeled = np.array([status == Status.Labeled
                                 for status in statuses])
        if np.sum(mask_labeled) == 0:
            return model

        unlabeled_indices = np.where(~mask_labeled)[0]
        if len(unlabeled_indices) != 0:
            unlabeled_mark = labels[unlabeled_indices[0]]
            classes = np.array(
                [d for d in np.unique(labels) if d != unlabeled_mark])
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

        if model.type == DefaultLabelingMethodType.Null:
            predictor = None
        elif model.type == DefaultLabelingMethodType.Random:
            predictor = None
        elif model.type == DefaultLabelingMethodType.DecisionTree:
            not_fitted = model.predictor is None
            estimator = DecisionTreeClassifier() if not_fitted\
                else model.predictor.estimator
            estimator = estimator.fit(X_train, y_train)
            predictor = EstimatorWithLabelDecoder(
                estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingMethodType.SVM:
            # sklearn.svm.SVC doesn't support the edge case with one class
            if len(np.unique(y_train)) == 1:
                estimator = DummyClassifier(strategy='most_frequent')
            else:
                not_fitted = model.predictor is None\
                    or model.predictor.estimator.__class__.__name__ == 'DummyClassifier'
                estimator = SVC(gamma=0.001) if not_fitted\
                    else model.predictor.estimator
            estimator = estimator.fit(X_train, y_train)
            predictor = EstimatorWithLabelDecoder(
                estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingMethodType.LogisticRegression:
            # sklearn.linear_model.LogisticRegression doesn't support the edge case with one class
            if len(np.unique(y_train)) == 1:
                estimator = DummyClassifier(strategy='most_frequent')
            else:
                not_fitted = model.predictor is None\
                    or model.predictor.estimator.__class__.__name__ == 'DummyClassifier'
                estimator = make_pipeline(
                    StandardScaler(),
                    LogisticRegression(C=1, penalty='l2',
                                       tol=0.01, solver='saga'),
                ) if not_fitted else model.predictor.estimator
            estimator = estimator.fit(X_train, y_train)
            predictor = EstimatorWithLabelDecoder(
                estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingMethodType.LabelSpreading:
            not_fitted = model.predictor is None
            estimator = LabelSpreading(gamma=0.25, max_iter=20) if not_fitted\
                else model.predictor.estimator
            estimator = estimator.fit(X, y)
            predictor = EstimatorWithLabelDecoder(
                estimator=estimator, encoder=encoder)
        elif model.type == DefaultLabelingMethodType.RestrictedBoltzmannMachine:
            # sklearn.neural_network.BernoulliRBM doesn't support the edge case with one class
            if len(np.unique(y_train)) == 1:
                estimator = DummyClassifier(strategy='most_frequent')
            else:
                not_fitted = model.predictor is None\
                    or model.predictor.estimator.__class__.__name__ == 'DummyClassifier'
                estimator = make_pipeline(
                    BernoulliRBM(random_state=0),
                    LogisticRegression(solver='newton-cg', tol=1),
                ) if not_fitted else model.predictor.estimator
            estimator = estimator.fit(X_train, y_train)
            predictor = EstimatorWithLabelDecoder(
                estimator=estimator, encoder=encoder)

        if model.type in [
            DefaultLabelingMethodType.Null,
            DefaultLabelingMethodType.Random,
        ]:
            sampler = None
        elif model.type in [
            DefaultLabelingMethodType.DecisionTree,
            DefaultLabelingMethodType.SVM,
            DefaultLabelingMethodType.RestrictedBoltzmannMachine,
        ]:
            if len(np.unique(y_train)) == 1:
                sampler = None
            else:
                not_fitted = model.sampler is None
                estimator = estimator = make_pipeline(
                    StandardScaler(),
                    LogisticRegression(C=1, penalty='l2',
                                       tol=0.01, solver='saga'),
                ) if not_fitted else model.sampler.estimator
                estimator = estimator.fit(X_train, y_train)
                sampler = EstimatorWithLabelDecoder(
                    estimator=estimator, encoder=encoder)
        elif model.type in [
            DefaultLabelingMethodType.LogisticRegression,
            DefaultLabelingMethodType.LabelSpreading,
        ]:
            sampler = predictor

        model_updated = Model(
            type=model.type,
            sampling_strategy=model.sampling_strategy,
            predictor=predictor,
            sampler=sampler,
        )
        return model_updated
