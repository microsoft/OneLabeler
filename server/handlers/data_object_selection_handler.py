import json
from typing import List, Union

import numpy as np
from sklearn.exceptions import NotFittedError
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
from .utils.data_labeling.types import (
    BuiltInSamplingStrategyType,
    DataObject,
    Model,
    Status,
)
from .utils.load_estimator import load_estimator


class DataObjectSelectionHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        if key not in [
            'Random', 'Cluster', 'DenseAreas',
            'ClusterCentroids', 'Entropy',
            'LeastConfident', 'SmallestMargin',
        ]:
            # The service is not found.
            self.send_error(404)
            return

        # process input: (labels, features?, model?, dataObjects?)
        data_objects: List[DataObject] = json_data['dataObjects']
        statuses: List[Status] = json_data['statuses']
        n_batch: int = json_data['nBatch']
        model: Union[Model, None] = json_data['model']\
            if 'model' in json_data else None

        # data structure transformation
        statuses = np.array([d['value'] for d in statuses], dtype=str)

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
            assert model['type'] in ['LogisticRegression', 'LabelSpreading'],\
                'provided model cannot be used for sampling'
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
                query_indices = random_sampling(
                    data_objects, statuses, n_batch)

        query_indices = query_indices.tolist()

        self.write({'queryIndices': query_indices})
