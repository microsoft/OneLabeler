"""
The module for feature extraction for image data objects.
"""

from typing import List, Tuple

import cv2 as cv
import numpy as np
from skimage.feature import greycomatrix, greycoprops, hog, local_binary_pattern
from skimage.filters import sobel
from skimage.filters.rank import entropy
from skimage.measure import shannon_entropy
from skimage.morphology import disk
from sklearn import decomposition
# from tensorflow.keras.applications.vgg16 import preprocess_input, VGG16


def raw_flatten(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by simply flattening the normalized image.

    The images are normalized by converting to grey image and resized to (8, 8).

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
    """
    # pylint: disable=invalid-name

    # normalized the images to gray scale 8 x 8
    h, w = 8, 8
    X_raw_normalized = []
    for img in imgs:
        img_gray = img if len(img.shape) == 2 else cv.cvtColor(
            img, cv.COLOR_BGR2GRAY)
        img_resized = cv.resize(img_gray, (h, w), interpolation=cv.INTER_AREA)
        X_raw_normalized.append(img_resized)
    X_raw_normalized = np.array(X_raw_normalized)

    # simply flatten the image
    X = X_raw_normalized.reshape((-1, h * w))
    feature_names = [f'raw[{i}][{j}]' for i in range(h) for j in range(w)]
    return X, feature_names


def dimension_reduction(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by dimension reduction for the normalized image.

    The images are normalized by converting to grey image and resized to (8, 8).
    The dimension reduction is conducted with PCA.

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
        img_resized = cv.resize(img_gray, (h, w), interpolation=cv.INTER_AREA)
        X_raw_normalized.append(img_resized)
    X_raw_normalized = np.array(X_raw_normalized)

    X_flatten = X_raw_normalized.reshape((-1, h * w))

    n_components = 5
    reducer = decomposition.TruncatedSVD(n_components=n_components)

    X = reducer.fit_transform(X_flatten)
    feature_names = [f'projection[{i}]' for i in range(n_components)]
    return X, feature_names


def color_descriptors_single(img: np.ndarray,
                             return_feature_names: bool = True,
                             ) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for a single image by handcrafted color features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.
    return_feature_names : bool
        Whether to return feature names.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name, too-many-locals

    # normalize the image to color image
    img_color = img if len(img.shape) == 3 else cv.cvtColor(
        img, cv.COLOR_GRAY2BGR)

    img_hsv = cv.cvtColor(img_color, cv.COLOR_BGR2HSV)
    channels = {
        'gray': cv.cvtColor(img_color, cv.COLOR_BGR2GRAY),
        'b': img_color[:, :, 0],
        'g': img_color[:, :, 1],
        'r': img_color[:, :, 2],
        'h': img_hsv[:, :, 0],
        's': img_hsv[:, :, 1],
        'v': img_hsv[:, :, 2],
    }

    n_hist_bins = 16

    x = []
    for channel in channels:
        img_channel = channels[channel]
        h, w = img_channel.shape

        # histogram
        hist, _ = np.histogram(img_channel, bins=n_hist_bins, range=(0, 256))
        # normalize with image size to make the histogram invariant to image scaling
        hist = hist / (h * w)

        # median, mean, std
        median = np.median(img_channel[:, :])
        mean = np.mean(img_channel[:, :])
        std = np.std(img_channel[:, :])

        x += [*hist, median, mean, std]
    x = np.array(x)

    if return_feature_names:
        dims = [f'hist[{i}]' for i in range(n_hist_bins)]\
            + ['median', 'mean', 'std']
        feature_names = [f'color-{channel}-{dim}'
                         for channel in channels for dim in dims]
        return x, feature_names
    return x


def color_descriptors(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by handcrafted color features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name

    X = np.array([color_descriptors_single(img, False) for img in imgs])

    channels = ['gray', 'b', 'g', 'r', 'h', 's', 'v']
    n_hist_bins = 16
    dims = [f'hist[{i}]' for i in range(
        n_hist_bins)] + ['median', 'mean', 'std']
    feature_names = [
        f'color-{channel}-{dim}' for channel in channels for dim in dims]
    return X, feature_names


def edge_descriptors_single(img: np.ndarray,
                            return_feature_names: bool = True) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for a single image by handcrafted edge features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.
    return_feature_names : bool
        Whether to return feature names.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name

    # normalize the image to gray image
    img_gray = img if len(img.shape) == 2 else cv.cvtColor(
        img, cv.COLOR_BGR2GRAY)
    # Note: in sobel edge detection implemenetation,
    # the image is first converted to float image on [0, 1]
    # then sobel filter is run on the float image
    # where the filter result is bounded in [0, 1]
    img_edge = sobel(img_gray)

    n_hist_bins = 16

    h, w = img_edge.shape

    # histogram
    hist, _ = np.histogram(img_edge, bins=n_hist_bins, range=(0, 1))
    # normalize with image size to make the histogram invariant to image scaling
    hist = hist / (h * w)

    # median, mean, std
    median = np.median(img_edge[:, :])
    mean = np.mean(img_edge[:, :])
    std = np.std(img_edge[:, :])

    x = np.array([*hist, median, mean, std])

    if return_feature_names:
        dims = [f'hist[{i}]' for i in range(
            n_hist_bins)] + ['median', 'mean', 'std']
        feature_names = [f'edge-{dim}' for dim in dims]
        return x, feature_names
    return x


def edge_descriptors(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by handcrafted edge features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name

    X = np.array([edge_descriptors_single(img, False) for img in imgs])

    n_hist_bins = 16
    dims = [f'hist[{i}]' for i in range(
        n_hist_bins)] + ['median', 'mean', 'std']
    feature_names = [f'edge-{dim}' for dim in dims]
    return X, feature_names


def edge_direction_descriptors_single(img: np.ndarray,
                                      return_feature_names: bool = True,
                                      ) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for a single image by handcrafted edge features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.
    return_feature_names : bool
        Whether to return feature names.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name

    # normalize the image to color image of size 96 x 96
    h, w = 96, 96
    img_color = img if len(img.shape) == 3 else cv.cvtColor(
        img, cv.COLOR_GRAY2BGR)
    img_resized = cv.resize(img_color, (h, w), interpolation=cv.INTER_AREA)

    # hog descriptor of size (96/6, 96/6, 1, 1, 8) and then flattened
    x = hog(img_resized, orientations=8, pixels_per_cell=(6, 6),
            cells_per_block=(1, 1), visualize=False,
            feature_vector=True, multichannel=True)

    if return_feature_names:
        feature_names = [f'edge-hog-{i}' for i in range(len(x))]
        return x, feature_names
    return x


def edge_direction_descriptors(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by handcrafted edge features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name

    X = np.array([edge_direction_descriptors_single(img, False)
                  for img in imgs])

    # reduce the dimension of hog features to save space
    n_components = 50
    reducer = decomposition.TruncatedSVD(n_components=n_components)
    X_proj = reducer.fit_transform(X)

    feature_names = [f'edge-hog-{i}' for i in range(n_components)]
    return X_proj, feature_names


def texture_descriptors_single(img: np.ndarray,
                               return_feature_names: bool = True) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for a single image by handcrafted texture features.

    The images are normalized by converting to gray image.

    Args
    ----
    img : np.ndarray
        The image to extract features.
    return_feature_names : bool
        Whether to return feature names.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name, too-many-locals

    # normalize the image to gray image
    img_gray = img if len(img.shape) == 2 else cv.cvtColor(
        img, cv.COLOR_BGR2GRAY)

    # local binary pattern
    radius = 3
    n_points = 8 * radius
    img_lbp = local_binary_pattern(
        img_gray, n_points, radius, method='uniform')
    lbp_hist, _ = np.histogram(img_lbp, bins=n_points+1, range=(0, n_points+1))

    # grey level co-occurrence matrix
    distances = [1, 2]
    angles = [0, np.pi/4, np.pi/2, 3*np.pi/4]
    glcm = greycomatrix(img_gray, distances, angles,
                        256, symmetric=True, normed=True)
    contrast = greycoprops(glcm, 'contrast').reshape(-1)
    dissimilarity = greycoprops(glcm, 'dissimilarity').reshape(-1)
    homogeneity = greycoprops(glcm, 'homogeneity').reshape(-1)
    energy = greycoprops(glcm, 'energy').reshape(-1)
    correlation = greycoprops(glcm, 'correlation').reshape(-1)

    # entropy
    global_entropy = shannon_entropy(img_gray)

    # local entropy
    n_hist_bins = 20
    mask = disk(7)
    local_entropy = entropy(img_gray, mask)
    # for images with value range [0, 255], the maximum local entropy is 8
    entropy_upper_bound = 8
    local_entropy_hist, _ = np.histogram(
        local_entropy, bins=n_hist_bins, range=(0, entropy_upper_bound))

    x = [*lbp_hist, *contrast, *dissimilarity, *homogeneity, *
         energy, *correlation, global_entropy, *local_entropy_hist]

    if return_feature_names:
        feature_names = [f'texture-lbp[{i}]' for i in range(len(lbp_hist))]\
            + [f'texture-contrast[{i}]' for i in range(len(contrast))]\
            + [f'texture-dissimilarity[{i}]' for i in range(len(dissimilarity))]\
            + [f'texture-homogeneity[{i}]' for i in range(len(homogeneity))]\
            + [f'texture-energy[{i}]' for i in range(len(energy))]\
            + [f'texture-correlation[{i}]' for i in range(len(correlation))]\
            + ['entropy']\
            + [f'texture-localentropy[{i}]' for i in range(len(local_entropy_hist))]
        return x, feature_names
    return x


def texture_descriptors(imgs: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by handcrafted edge features.

    The images are normalized by converting to color image.

    Args
    ----
    img : np.ndarray
        The image to extract features.

    Returns
    -------
    x : np.ndarray
        The extracted feature values.
    feature_names : List[str]
        The names of features.
    """
    # pylint: disable=invalid-name

    X = np.array([texture_descriptors_single(img, False) for img in imgs])

    feature_names = [f'texture-lbp[{i}]' for i in range(25)]\
        + [f'texture-contrast[{i}]' for i in range(8)]\
        + [f'texture-dissimilarity[{i}]' for i in range(8)]\
        + [f'texture-homogeneity[{i}]' for i in range(8)]\
        + [f'texture-energy[{i}]' for i in range(8)]\
        + [f'texture-correlation[{i}]' for i in range(8)]\
        + ['entropy']\
        + [f'texture-localentropy[{i}]' for i in range(20)]
    return X, feature_names
