from typing import Any, List, Union

import numpy as np

from ...types import StatusType

ListLike = Union[List[Any], np.ndarray]


def random_sampling(data_objects: ListLike,
                    statuses: np.ndarray,
                    n_batch: int) -> np.ndarray:
    """
    Random sample unlabeled data objects.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
        This parameter is not used.
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

    del data_objects  # unused argument

    new_indices = np.where(statuses == StatusType.New)[0]
    if len(new_indices) < n_batch:
        query_indices = new_indices
        skipped_indices = np.where(statuses == StatusType.Skipped)[0]
        n_residue = n_batch - len(query_indices)
        query_indices_skipped = skipped_indices if len(skipped_indices) <= n_residue\
            else np.random.choice(skipped_indices, size=n_residue, replace=False)
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = np.random.choice(new_indices,
                                     size=n_batch, replace=False)
    return query_indices
