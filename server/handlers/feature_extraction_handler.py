from typing import Any, List, Tuple, Union
import json

import cv2 as cv
import numpy as np
from sklearn.preprocessing import LabelEncoder
import tornado.web

from .utils.data_labeling.feature_extraction import (
    raw_flatten,
    resize_SVD,
    resize_LDA,
    color_descriptors,
    edge_descriptors,
    edge_direction_descriptors,
    texture_descriptors
)

ListLike = Union[List[Any], np.ndarray]


def extract_features_img_SVD(data_objects: ListLike
                             ) -> Tuple[ListLike, List[str]]:
    imgs = []
    for data_object in data_objects:
        path = data_object['path']
        img = cv.imread(path)
        imgs.append(img)
        data_object['width'] = img.shape[1]
        data_object['height'] = img.shape[0]

    X, feature_names = resize_SVD(imgs)
    for i, data_object in enumerate(data_objects):
        data_objects[i]['features'] = X[i]

    for data_object in data_objects:
        data_object['features'] = data_object['features'].tolist()

    return data_objects, feature_names


def extract_features_img_BoW(data_objects: ListLike
                             ) -> Tuple[ListLike, List[str]]:
    imgs = []
    for data_object in data_objects:
        path = data_object['path']
        img = cv.imread(path)
        imgs.append(img)
        data_object['width'] = img.shape[1]
        data_object['height'] = img.shape[0]

    extractors = [
        raw_flatten,
        resize_SVD,
        color_descriptors,
        edge_descriptors,
        edge_direction_descriptors,
        texture_descriptors,
    ]

    X = None
    feature_names = []
    for extractor in extractors:
        X_tmp, feature_names_tmp = extractor(imgs)
        X = np.hstack((X, X_tmp)) if X is not None else X_tmp
        feature_names = feature_names + feature_names_tmp\
            if feature_names is not None else feature_names_tmp
    for i, data_object in enumerate(data_objects):
        data_objects[i]['features'] = X[i]

    for data_object in data_objects:
        data_object['features'] = data_object['features'].tolist()

    return data_objects, feature_names


def extract_features_img_LDA(data_objects: ListLike,
                             labels: np.ndarray,
                             statuses: np.ndarray) -> Tuple[ListLike, List[str]]:
    imgs = []
    for data_object in data_objects:
        path = data_object['path']
        img = cv.imread(path)
        imgs.append(img)
        data_object['width'] = img.shape[1]
        data_object['height'] = img.shape[0]

    X, feature_names = resize_LDA(imgs, labels, statuses)
    
    for i, data_object in enumerate(data_objects):
        data_objects[i]['features'] = X[i].tolist()

    return data_objects, feature_names


class FeatureExtractionHandler(tornado.web.RequestHandler):
    """
    The handler for feature extraction.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        assert key in ['image/SVD', 'image/BoW', 'image/LDA']

        # process input: (dataObjects, labels?, statuses?)
        data_objects = json_data['dataObjects']
        labels = json_data['labels'] if 'labels' in json_data else None
        statuses = json_data['statuses'] if 'statuses' in json_data else None

        if key == 'image/SVD':
            data_objects, feature_names = extract_features_img_SVD(
                data_objects)
        if key == 'image/BoW':
            data_objects, feature_names = extract_features_img_BoW(
                data_objects)
        if key == 'image/LDA':
            labels = np.array(labels, dtype=str)
            statuses = np.array(statuses, dtype=str)
            data_objects, feature_names = extract_features_img_LDA(
                data_objects, labels, statuses)

        self.write({
            'dataObjects': data_objects,
            'featureNames': feature_names,
        })
