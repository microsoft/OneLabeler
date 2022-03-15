# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import List, Tuple
import json

import cv2 as cv
import numpy as np
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.preprocessing import LabelEncoder
from sklearn.random_projection import GaussianRandomProjection
from tornado.web import RequestHandler

from ..types import (
    DataObject,
    Label,
    Status,
    StatusType,
)
from .utils import get_image


def resize_LDA(imgs: np.ndarray,
               labels: np.ndarray,
               statuses: np.ndarray) -> Tuple[np.ndarray, List[str]]:
    """
    Extract features for each image by dimension reduction for the normalized image.

    The images are normalized by converting to grey image and resized to (8, 8).
    The dimension reduction is conducted with LDA.

    Args
    ----
    imgs : np.ndarray
        The images to extract features.
    labels : np.ndarray
        The partial labels.

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

    mask_labeled = np.array([status == StatusType.Labeled
                            for status in statuses])
    X_labeled = X_flatten[mask_labeled]
    labels_labeled = labels[mask_labeled]

    categories = np.array([d for d in np.unique(labels_labeled)])
    labels_labeled = LabelEncoder().fit(categories).transform(labels_labeled)

    if len(labels_labeled) <= 1:
        n_components_actual = n_components
        reducer = GaussianRandomProjection(n_components=n_components_actual)
        X = reducer.fit_transform(X_flatten)
    else:
        n_samples, n_features = X_flatten.shape
        n_categories = len(np.unique(labels_labeled))
        n_components_actual = min(n_samples, n_features,
                                  n_categories - 1, n_components)
        reducer = LinearDiscriminantAnalysis(n_components=n_components_actual)

        reducer.fit(X_labeled, labels_labeled)
        X = reducer.transform(X_flatten)

    if n_components > n_components_actual:
        zeros = np.zeros((n_samples, n_components -
                         n_components_actual), dtype=float)
        X = np.hstack((X, zeros))

    feature_names = [f'LDA[{i}]' for i in range(n_components)]
    return X, feature_names


def extract_features(data_objects: List[DataObject],
                     labels: np.ndarray,
                     statuses: np.ndarray,
                     ) -> Tuple[List[List[float]], List[str]]:
    imgs = [get_image(data_object) for data_object in data_objects]
    X, feature_names = resize_LDA(imgs, labels, statuses)
    return X.tolist(), feature_names


class Handler(RequestHandler):
    """
    The handler for feature extraction - image LDA.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects)
        data_objects: List[DataObject] = json_data['dataObjects']
        labels: List[Label] = json_data['labels'] if 'labels' in json_data else None
        statuses: List[Status] = json_data['statuses'] if 'statuses' in json_data else None

        labels = np.array([d['category'] for d in labels], dtype=str)
        statuses = np.array([d['value'] for d in statuses], dtype=str)
        features, feature_names = extract_features(
            data_objects, labels, statuses)

        self.write({
            'features': features,
            'featureNames': feature_names,
        })
