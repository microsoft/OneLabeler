from typing import Any, List, Union

import numpy as np
from scipy import stats
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics.pairwise import rbf_kernel
from sklearn.neighbors import KernelDensity
from modAL.uncertainty import (classifier_uncertainty,
                               classifier_margin,
                               classifier_entropy)

from .types import Model, Status

ListLike = Union[List[Any], np.ndarray]


def multi_argmax(values: np.ndarray,
                 n_instances: int = 1,
                 kind: str = 'fast',
                 random_state: Union[int, np.random.RandomState, None] = None) -> np.ndarray:
    """
    Shuffles the values and sorts them afterwards. This can be used to break
    the tie when the highest utility score is not unique. The shuffle randomizes
    order, which is preserved by the mergesort algorithm.

    Args
    ----
    values : np.ndarray
        Contains the values to be selected from.
    n_instances : int
        Specifies how many indices to return.
    kind : {'fast', 'random', 'stable'}, optional
        Sorting algorithm.
        'fast' - the fastest algorithm without tie breaking, O(n).
        'random' - random tie break, O(n).
        'stable' - stable sorting, O(nlogn).
    random_state : Union[int, np.random.RandomState, None], optional (default=None)
        The random number generator.
        Used only when kind == 'random'.
        If int, random_state is the seed used by the random number generator.
        If RandomState instance, random_state is the random number generator.
        If None, the random number generator is the RandomState instance used by np.random.

    Returns
    -------
    indices : np.ndarray
        The indices of the n_instances largest values.

    Notes
    -----
    This argmax implementation is faster than the shuffled_argmax implementation in modAL
    when kind is 'fast', 'random', 'stable'.

    Examples
    --------
    >>> import numpy as np
    >>> values = np.random.randint(0, 200, 4000)
    >>> %timeit argmax(values, kind='fast')
    33.6 µs ± 1.61 µs per loop (mean ± std. dev. of 7 runs, 10000 loops each)

    >>> %timeit argmax(values, kind='random')
    178 µs ± 15.8 µs per loop (mean ± std. dev. of 7 runs, 10000 loops each)

    >>> %timeit argmax(values, kind='stable')
    213 µs ± 2.96 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

    >>> %timeit argmax(values, n_instances=200, kind='fast')
    39.3 µs ± 1.73 µs per loop (mean ± std. dev. of 7 runs, 10000 loops each)

    >>> %timeit argmax(values, n_instances=200, kind='random')
    231 µs ± 9.42 µs per loop (mean ± std. dev. of 7 runs, 1000 loops each)

    Reference
    ---------
    [1] shuffled_argmax implementation in modAL
    https://github.com/modAL-python/modAL/blob/4029dfd4e5f68509a409d509ed706f544472bf25/modAL/utils/selection.py
    """

    assert kind in ['fast', 'random', 'stable'], f'invalid kind: {kind}'
    assert n_instances <= values.shape[0],\
        'n_instances must be less or equal than the size of utility'

    if kind == 'fast':
        # np.argpartition uses introselect algorithm
        # unstable partial sort, time O(n)
        indices = np.argpartition(values, -n_instances)[-n_instances:]
        indices = indices[np.argsort(values[indices])[::-1]]
        return indices

    if kind == 'random':
        random_state = check_random_state(random_state)

        # shuffling indices and corresponding values
        shuffled_idx = random_state.permutation(len(values))
        shuffled_values = values[shuffled_idx]

        # unstable partial sort, time O(n)
        sorted_indices = np.argpartition(
            shuffled_values, -n_instances)[-n_instances:]
        sorted_indices = sorted_indices[np.argsort(
            shuffled_values[sorted_indices])[::-1]]

        indices = shuffled_idx[sorted_indices]
        return indices

    if kind == 'stable':
        # stable sort, time O(nlogn)
        indices = (len(values) - 1) - \
            np.argsort(values[::-1], kind='stable')[-n_instances:]
        indices = indices[np.argsort(values[indices])[::-1]]
        return indices


def index_in_subset_to_index_in_all(index_in_subset: int,
                                    mask_subset: np.ndarray) -> int:
    """
    Transform the index in subset (stored as mask_subset) to the index in the whole set.

    Args
    ----
    index_in_subset : int
        The index in subset.
    mask_subset : np.ndarray of boolean values
        The mask denoting the selection of subset.

    Examples
    --------
    >>> mask_subset = np.array([True, False, True, False, True, False], dtype=bool)
    >>> index_in_subset = 2
    >>> index_in_subset_to_index_in_all(index_in_subset, mask_subset) 
    4
    """

    assert index_in_subset >= 0 and index_in_subset <= np.sum(mask_subset) - 1,\
        f'index_in_subset = {index_in_subset} exceed valid indices of subset [0, {np.sum(mask_subset) - 1}]'

    index_in_all = index_in_subset
    for i in range(len(mask_subset)):
        if not mask_subset[i] and i <= index_in_all:
            index_in_all += 1
        if i > index_in_all:
            break
    return index_in_all


def masked_multi_argmax(values: np.ndarray,
                        mask: np.ndarray,
                        n_instances: int = 1,
                        kind: str = 'fast',
                        random_state: Union[int, np.random.RandomState, None] = None) -> np.ndarray:
    assert len(values) == len(mask),\
        'len(values) != len(mask)'
    assert np.sum(mask) >= n_instances,\
        'number of remaining data objects less than n_instances'

    values_masked = values[mask]
    indices = multi_argmax(
        values=values_masked,
        n_instances=n_instances,
        kind=kind,
        random_state=random_state
    )
    indices = np.array([index_in_subset_to_index_in_all(idx, mask)
                        for idx in indices])
    return indices


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
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    del data_objects  # unused argument

    new_indices = np.where(statuses == Status.NEW)[0]
    if len(new_indices) <= n_batch:
        query_indices = new_indices
        skipped_indices = np.where(statuses == Status.SKIPPED)[0]
        n_residue = n_batch - len(query_indices)
        query_indices_skipped = skipped_indices if len(skipped_indices) <= n_residue\
            else np.random.choice(skipped_indices, size=n_residue, replace=False)
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = np.random.choice(new_indices,
                                     size=n_batch, replace=False)
    return query_indices


def cluster_sampling(data_objects: ListLike,
                     statuses: np.ndarray,
                     n_batch: int) -> np.ndarray:
    """
    Sample unlabeled data objects by the distance to cluster centers.
    The clusters are computed by k-means.
    Data objects at places closer to cluster centers are sampled with higher priorities.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    mask_new = statuses == Status.NEW
    new_indices = np.where(mask_new)[0]
    X = np.array([data_object['features'] for data_object in data_objects])

    n_clusters = min(8, len(X))
    clusterer = KMeans(n_clusters=n_clusters, random_state=0).fit(X)
    cluster_centers = clusterer.cluster_centers_
    cluster_labels = clusterer.labels_
    cluster_sizes = np.array([np.sum(cluster_labels == i)
                              for i in range(n_clusters)])
    K = rbf_kernel(X, cluster_centers)
    scores = K.dot(cluster_sizes)

    if len(new_indices) <= n_batch:
        query_indices = new_indices
        mask_skipped = statuses == Status.SKIPPED
        skipped_indices = np.where(mask_skipped)[0]
        n_residue = n_batch - len(query_indices)
        if len(skipped_indices) <= n_residue:
            query_indices_skipped = skipped_indices
        else:
            query_indices_skipped = masked_multi_argmax(
                values=scores,
                mask=mask_skipped,
                n_instances=n_residue,
            )
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = masked_multi_argmax(
        values=scores,
        mask=mask_new,
        n_instances=n_batch,
    )
    return query_indices


def density_sampling(data_objects: ListLike,
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
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    def scotts_factor(n_samples: int, n_features: int) -> float:
        return n_samples**(-1.0 / (n_features + 4))

    mask_new = statuses == Status.NEW
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
        mask_skipped = statuses == Status.SKIPPED
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


def entropy_sampling(data_objects: ListLike,
                     statuses: np.ndarray,
                     n_batch: int,
                     model: Model) -> np.ndarray:
    """
    Sample unlabeled data objects by the posterior label distribution entropy.
    The posterior label distribution is estimated by the interim model.
    Data objects at places with higher label entropy are sampled with higher priorities.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.
    model : Model
        The interim model.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    mask_new = statuses == Status.NEW
    new_indices = np.where(mask_new)[0]
    X = np.array([data_object['features'] for data_object in data_objects])

    content = model.content
    if content is None:
        return random_sampling(data_objects, statuses, n_batch)

    entropies = classifier_entropy(content, X)

    if len(new_indices) <= n_batch:
        query_indices = new_indices
        mask_skipped = statuses == Status.SKIPPED
        skipped_indices = np.where(mask_skipped)[0]
        n_residue = n_batch - len(query_indices)
        if len(skipped_indices) <= n_residue:
            query_indices_skipped = skipped_indices
        else:
            query_indices_skipped = masked_multi_argmax(
                values=entropies,
                mask=mask_skipped,
                n_instances=n_residue,
            )
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = masked_multi_argmax(
        values=entropies,
        mask=mask_new,
        n_instances=n_batch,
    )
    return query_indices


def confidence_sampling(data_objects: ListLike,
                        statuses: np.ndarray,
                        n_batch: int,
                        model: Model) -> np.ndarray:
    """
    Sample unlabeled data objects by the confidence of the label prediction.
    The label prediction is estimated by the interim model.
    Data objects at places with less confidence are sampled with higher priorities.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.
    model : Model
        The interim model.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    mask_new = statuses == Status.NEW
    new_indices = np.where(mask_new)[0]
    X = np.array([data_object['features'] for data_object in data_objects])

    content = model.content
    if content is None:
        return random_sampling(data_objects, statuses, n_batch)

    uncertainty = classifier_uncertainty(content, X)

    if len(new_indices) <= n_batch:
        query_indices = new_indices
        mask_skipped = statuses == Status.SKIPPED
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


def margin_sampling(data_objects: ListLike,
                    statuses: np.ndarray,
                    n_batch: int,
                    model: Model) -> np.ndarray:
    """
    Sample unlabeled data objects by the margin of the label distribution.
    The label distribution is estimated by the interim model.
    Data objects at places with smaller margins are sampled with higher priorities.
    Skipped data objects have lower priorities.

    Args
    ----
    data_objects : np.ndarray or list of any values, length = n_pool
        The whole list of data objects, no matter labeled or unlabeled.
    statuses : np.ndarray of any values, dtype = objects, shape = (n_pool,)
        The label statuses of the data objects.
        Each entry takes value in
        [Status.NEW, Status.VIEWED, Status.SKIPPED, Status.LABELED].
    n_batch : int
        The number of data objects to sample.
    model : Model
        The interim model.

    Returns
    -------
    query_indices : np.ndarray of int values, shape = (n_batch,)
        The indices of the sampled data objects in the whole list.
    """

    mask_new = statuses == Status.NEW
    new_indices = np.where(mask_new)[0]
    X = np.array([data_object['features'] for data_object in data_objects])

    content = model.content
    if content is None:
        return random_sampling(data_objects, statuses, n_batch)

    neg_margin = -classifier_margin(content, X)

    if len(new_indices) <= n_batch:
        query_indices = new_indices
        mask_skipped = statuses == Status.SKIPPED
        skipped_indices = np.where(mask_skipped)[0]
        n_residue = n_batch - len(query_indices)
        if len(skipped_indices) <= n_residue:
            query_indices_skipped = skipped_indices
        else:
            query_indices_skipped = masked_multi_argmax(
                values=neg_margin,
                mask=mask_skipped,
                n_instances=n_residue,
            )
        query_indices = np.concatenate((query_indices, query_indices_skipped))
        return query_indices

    query_indices = masked_multi_argmax(
        values=neg_margin,
        mask=mask_new,
        n_instances=n_batch,
    )
    return query_indices
