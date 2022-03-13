from typing import List, Tuple

import cv2 as cv
import numpy as np
from sklearn.decomposition import TruncatedSVD


def resize_SVD(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by dimension reduction for the normalized image.

    The images are normalized by converting to grey image and resized to (8, 8).
    The dimension reduction is conducted with SVD.

    Args
    ----
    imgs : np.ndarray
        The images to extract features.

    Returns
    -------
    X : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.

    Notes
    -----
    Variations:
    1. change the dimension reduction method (e.g., MDS, t-SNE, isomap)
    2. change the number of projected dimensions
    """
    # pylint: disable=invalid-name

    # normalized the images to gray scale 8 x 8
    h, w = 8, 8
    X_raw_normalized = []
    for img in imgs:
        img_gray = img if len(img.shape) == 2 else cv.cvtColor(
            img, cv.COLOR_BGR2GRAY)
        img_resized = cv.resize(img_gray, (h, w),
                                interpolation=cv.INTER_AREA)
        X_raw_normalized.append(img_resized)
    X_raw_normalized = np.array(X_raw_normalized)

    X_flatten = X_raw_normalized.reshape((-1, h * w))

    n_components = 5

    n_samples, n_features = X_flatten.shape
    n_components_actual = min(n_samples, n_features, n_components)

    reducer = TruncatedSVD(n_components=n_components_actual)
    X = reducer.fit_transform(X_flatten)
    if n_components > n_components_actual:
        zeros = np.zeros((n_samples, n_components -
                         n_components_actual), dtype=float)
        X = np.hstack((X, zeros))

    feature_names = [f'SVD[{i}]' for i in range(n_components)]
    return X, feature_names
