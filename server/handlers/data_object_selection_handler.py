import json

import numpy as np
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
        ]

        # process input: (labels, features?, model?, dataObjects?)
        labels = json_data['labels']
        statuses = json_data['statuses']
        data_objects = json_data['dataObjects']
        model = json_data['model']
        n_batch = json_data['nBatch']

        # data structure transformation
        labels = np.array(labels)
        statuses = np.array(statuses, dtype=str)
        features = np.array([data_object['features']
                             for data_object in data_objects])
        sampler = load(ObjectId(model['sampler']))\
            if model['sampler'] is not None else None

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

        query_indices = query_indices.tolist()

        self.write({'queryIndices': query_indices})
