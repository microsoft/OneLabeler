# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import Union

import numpy as np
from sklearn.utils import check_random_state


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
