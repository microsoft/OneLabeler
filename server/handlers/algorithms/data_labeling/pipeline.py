from copy import deepcopy
from typing import Any, List, Tuple, Union

import cv2 as cv
import numpy as np
from skimage.measure import shannon_entropy
from skimage.feature import greycomatrix, greycoprops
from skimage.filters import sobel
from sklearn.decomposition import PCA

from .generic import GenericPipeline
from .types import Status

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

    unlabeled_indices = np.where(statuses == Status.NEW)[0]
    if len(unlabeled_indices) <= n_batch:
        query_indices = unlabeled_indices
        skipped_indices = np.where(statuses == Status.SKIPPED)[0]
        n_residue = n_batch - len(query_indices)
        query_indices_skipped = skipped_indices if len(skipped_indices) <= n_residue\
            else np.random.choice(skipped_indices, size=n_residue, replace=False)
        query_indices = np.concatenate((query_indices, query_indices_skipped))
    else:
        query_indices = np.random.choice(unlabeled_indices,
                                         size=n_batch, replace=False)
    return query_indices


def handcraft_feature_extraction(imgs: np.ndarray) -> np.ndarray:
    """
    Args
    ----
    imgs : np.ndarray
        The images to extract features.
    """

    feature_names = [
        'entropy',
        'grey_hist',
        'edge_hist',
        'contrast',
        'dissimilarity',
        'energy',
    ]

    entropies = []
    grey_hists = []
    edge_hists = []
    contrasts = []
    dissimilarities = []
    energies = []
    for img in imgs:
        img_gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

        # Feature 1: entropy
        entropy = shannon_entropy(img_gray)
        entropies.append(entropy)

        # Feature 2: grey scale histogram projection first component
        hist, _ = np.histogram(img_gray, bins=10, range=(0, 255))
        grey_hists.append(hist)

        # Feature 3: edge histogram projection first component
        img_sobel = sobel(img_gray)
        hist, _ = np.histogram(img_sobel, bins=10, range=(0, 1))
        edge_hists.append(hist)

        # Feature 4: grey level co-occurrence matrix contrast
        glcm = greycomatrix(img_gray, distances=[5], angles=[0],
                            levels=256, symmetric=True, normed=True)
        contrast = greycoprops(glcm, 'contrast')[0][0]
        contrasts.append(contrast)

        # Feature 5: grey level co-occurrence matrix dissimilarity
        dissimilarity = greycoprops(glcm, 'dissimilarity')[0][0]
        dissimilarities.append(dissimilarity)

        # Feature 6: grey level co-occurrence matrix energy
        energy = greycoprops(glcm, 'energy')[0][0]
        energies.append(energy)

    grey_hist_projections = PCA(n_components=1).fit_transform(grey_hists)[:, 0]
    edge_hist_projections = PCA(n_components=1).fit_transform(edge_hists)[:, 0]

    n_samples = len(imgs)
    n_features = len(feature_names)
    X = np.zeros(shape=(n_samples, n_features))
    X[:, 0] = entropies
    X[:, 1] = grey_hist_projections
    X[:, 2] = edge_hist_projections
    X[:, 3] = contrasts
    X[:, 4] = dissimilarities
    X[:, 5] = energies

    return X, feature_names


class DataLabelingPipeline(GenericPipeline):
    @staticmethod
    def sample_data_objects(data_objects: ListLike,
                            statuses: np.ndarray,
                            n_batch: int) -> np.ndarray:
        """
        Sample a batch of data objects from the pool of data objects.

        Workflow Component - Data Object Sampling

        Args
        ----
        data_objects : ListLike
            The pool of data objects to be sampled from.
            Note that some data objects may be labeled.
        statuses : np.ndarray
            The label status of the data objects.
        n_batch : int
            The number of data objects to sample.

        Returns
        -------
        query_indices : np.ndarray of int values
            The indices of selected data objects.
        """

        query_indices = random_sampling(data_objects, statuses, n_batch)
        return query_indices

    @staticmethod
    def extract_features(data_objects: ListLike) -> Tuple[ListLike, List[str]]:
        data_objects = deepcopy(data_objects)
        imgs = []
        for data_object in data_objects:
            path = data_object['path']
            img = cv.imread(path)
            imgs.append(img)
            data_object['width'] = img.shape[1]
            data_object['height'] = img.shape[0]
        imgs = np.array(imgs)
        X, feature_names = handcraft_feature_extraction(imgs)
        for i, data_object in enumerate(data_objects):
            data_objects[i]['features'] = X[i]
        return data_objects, feature_names
