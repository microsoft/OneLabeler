import json
from typing import List, Union

from modAL.uncertainty import classifier_uncertainty
import numpy as np
from sklearn.base import BaseEstimator
from sklearn.exceptions import NotFittedError
from tornado.web import RequestHandler

from .utils import (
    masked_multi_argmax,
    random_sampling,
)
from ..types import (
    DataObject,
    Model,
    Status,
    StatusType,
)
from ..utils.load_estimator import load_estimator


def confidence_sampling(features: np.ndarray,
                        statuses: np.ndarray,
                        n_batch: int,
                        estimator: BaseEstimator) -> np.ndarray:
    """
    Sample unlabeled data objects by the confidence of the label prediction.
    The label prediction is estimated by the interim model.
    Data objects at places with less confidence are sampled with higher priorities.
    Skipped data objects have lower priorities.

    Args
    ----
    features : np.ndarray of any values, length = n_pool
        The features of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [StatusType.New, StatusType.Viewed, StatusType.Skipped, StatusType.Labeled].
    n_batch : int
        The number of data objects to sample.
    estimator: BaseEstimator
        The interim model.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    mask_new = statuses == StatusType.New
    new_indices = np.where(mask_new)[0]

    if estimator is None:
        return random_sampling(features, statuses, n_batch)

    uncertainty = classifier_uncertainty(estimator, features)

    if len(new_indices) <= n_batch:
        query_indices = new_indices
        mask_skipped = statuses == StatusType.Skipped
        skipped_indices = np.where(mask_skipped)[0]
        n_residue = n_batch - len(query_indices)
        if len(skipped_indices) <= n_residue:
            query_indices_skipped = skipped_indices
        else:
            query_indices_skipped = masked_multi_argmax(
                values=uncertainty,
                mask=mask_skipped,
                n_instances=n_residue,
            )
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = masked_multi_argmax(
        values=uncertainty,
        mask=mask_new,
        n_instances=n_batch,
    )
    return query_indices


class Handler(RequestHandler):
    """
    The handler for data object selection - least confident.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (labels, features, model)
        data_objects: List[DataObject] = json_data['dataObjects']
        
        features = np.array([data_object['features']
                             for data_object in data_objects])
        statuses: List[Status] = json_data['statuses']
        n_batch: int = json_data['nBatch']
        model: Union[Model, None] = json_data['model']\
            if 'model' in json_data else None

        # data structure transformation
        statuses = np.array([d['value'] for d in statuses], dtype=str)

        assert len(features) == len(statuses),\
            'len(features) != len(statuses)'

        if model is None:
            query_indices = random_sampling(features, statuses, n_batch)
        else:
            assert model['type'] in ['LogisticRegression', 'LabelSpreading'],\
                'provided model cannot be used for sampling'
            sampler = load_estimator(model)
            try:
                query_indices = confidence_sampling(
                    features, statuses, n_batch, sampler)
            except NotFittedError:
                query_indices = random_sampling(
                    features, statuses, n_batch)

        query_indices = query_indices.tolist()

        self.write({'queryIndices': query_indices})
