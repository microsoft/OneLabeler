import json
from typing import List

import numpy as np
from sklearn.decomposition import PCA
from sklearn.neighbors import KernelDensity
from tornado.web import RequestHandler

from .utils import masked_multi_argmax
from ..types import DataObject, Status, StatusType


def density_sampling(data_objects: List[DataObject],
                     statuses: np.ndarray,
                     n_batch: int) -> np.ndarray:
    """
    Sample unlabeled data objects by the data density.
    The density is estimated by gaussian kernel density estimation.
    Data objects at places with higher density are sampled with higher priorities.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [StatusType.New, StatusType.Viewed, StatusType.Skipped, StatusType.Labeled].
    n_batch : int
        The number of data objects to sample.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    def scotts_factor(n_samples: int, n_features: int) -> float:
        return n_samples**(-1.0 / (n_features + 4))

    mask_new = statuses == StatusType.New
    new_indices = np.where(mask_new)[0]
    X = np.array([data_object['features'] for data_object in data_objects])

    n_samples, n_features = X.shape
    n_components = min(2, n_features)
    X_pca = PCA(n_components=n_components, whiten=False).fit_transform(X)
    n_samples, n_dims = X_pca.shape
    bandwidth = scotts_factor(n_samples, n_dims)
    kde = KernelDensity(bandwidth=bandwidth).fit(X_pca)
    log_density = kde.score_samples(X_pca)

    if len(new_indices) <= n_batch:
        query_indices = new_indices
        mask_skipped = statuses == StatusType.Skipped
        skipped_indices = np.where(mask_skipped)[0]
        n_residue = n_batch - len(query_indices)
        if len(skipped_indices) <= n_residue:
            query_indices_skipped = skipped_indices
        else:
            query_indices_skipped = masked_multi_argmax(
                values=log_density,
                mask=mask_skipped,
                n_instances=n_residue,
            )
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = masked_multi_argmax(
        values=log_density,
        mask=mask_new,
        n_instances=n_batch,
    )
    return query_indices


class Handler(RequestHandler):
    """
    The handler for data object selection - dense areas.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects, statues, nBatch)
        data_objects: List[DataObject] = json_data['dataObjects']
        statuses: List[Status] = json_data['statuses']
        n_batch: int = json_data['nBatch']

        # data structure transformation
        statuses = np.array([d['value'] for d in statuses], dtype=str)

        assert len(data_objects) == len(statuses),\
            'len(data_objects) != len(statuses)'

        query_indices = density_sampling(data_objects, statuses, n_batch)
        query_indices = query_indices.tolist()

        self.write({'queryIndices': query_indices})
