import json

from bson.objectid import ObjectId
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.semi_supervised import LabelSpreading
import tornado.web

from .utils.data_labeling.sampling import (
    random_sampling,
    cluster_sampling,
    cluster_centroid_sampling,
    density_sampling,
    entropy_sampling,
    confidence_sampling,
    margin_sampling,
)
from .utils.data_labeling.types import BuiltInSamplingStrategyType
from .utils.data_persistence import is_saved, load, save


def load_estimator(model) -> BaseEstimator:
    estimator_type = model['type']
    estimator_id = model['objectId']

    assert estimator_type in [
        'LogisticRegression',
        'LabelSpreading',
    ]

    if is_saved(inserted_id=ObjectId(estimator_id)):
        estimator = load(inserted_id=ObjectId(estimator_id))
    else:
        if estimator_type == 'LogisticRegression':
            estimator = make_pipeline(
                StandardScaler(),
                LogisticRegression(C=1, penalty='l2',
                                   tol=0.01, solver='saga'),
            )
        if estimator_type == 'LabelSpreading':
            estimator = LabelSpreading(gamma=0.25, max_iter=20)
        save(data=estimator, inserted_id=ObjectId(estimator_id))
    return estimator


class DataObjectSelectionHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        assert key in [
            'Random', 'Cluster', 'DenseAreas',
            'ClusterCentroids', 'Entropy',
            'LeastConfident', 'SmallestMargin',
        ], f'Invalid sampling strategy: {key}'

        # process input: (labels, features?, model?, dataObjects?)
        statuses = json_data['statuses']
        data_objects = json_data['dataObjects']
        n_batch = json_data['nBatch']
        model = json_data['model']\
            if 'model' in json_data else None

        # data structure transformation
        statuses = np.array(statuses, dtype=str)

        assert len(data_objects) == len(statuses),\
            'len(data_objects) != len(statuses)'

        if key == BuiltInSamplingStrategyType.Random:
            query_indices = random_sampling(data_objects, statuses, n_batch)
        elif key == BuiltInSamplingStrategyType.Cluster:
            query_indices = cluster_sampling(data_objects, statuses, n_batch)
        elif key == BuiltInSamplingStrategyType.DenseAreas:
            query_indices = density_sampling(data_objects, statuses, n_batch)
        elif key == BuiltInSamplingStrategyType.ClusterCentroids:
            query_indices = cluster_centroid_sampling(
                data_objects, statuses, n_batch)
        elif model is None:
            query_indices = random_sampling(data_objects, statuses, n_batch)
        else:
            sampler = load_estimator(model)
            try:
                if key == BuiltInSamplingStrategyType.Entropy:
                    query_indices = entropy_sampling(
                        data_objects, statuses, n_batch, sampler)
                elif key == BuiltInSamplingStrategyType.LeastConfident:
                    query_indices = confidence_sampling(
                        data_objects, statuses, n_batch, sampler)
                elif key == BuiltInSamplingStrategyType.SmallestMargin:
                    query_indices = margin_sampling(
                        data_objects, statuses, n_batch, sampler)
            except NotFittedError:
                query_indices = random_sampling(data_objects, statuses, n_batch)

        query_indices = query_indices.tolist()

        self.write({'queryIndices': query_indices})
