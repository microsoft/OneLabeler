import base64
from typing import Any, List, Tuple, Union
import json

import cv2 as cv
import numpy as np
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer
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


def get_image(data_object) -> np.ndarray:
    data_url = data_object['content']
    base64str = data_url.split('base64,', 1)[1]
    img_arr = np.fromstring(base64.b64decode(base64str), np.uint8)
    img = cv.imdecode(img_arr, cv.IMREAD_COLOR)
    # return cv.imread(data_object['url'])
    return img


def extract_features_img_SVD(data_objects: ListLike
                             ) -> Tuple[ListLike, List[str]]:
    imgs = [get_image(data_object) for data_object in data_objects]

    X, feature_names = resize_SVD(imgs)
    for i, data_object in enumerate(data_objects):
        data_objects[i]['features'] = X[i]

    for data_object in data_objects:
        data_object['features'] = data_object['features'].tolist()

    return data_objects, feature_names


def extract_features_img_BoW(data_objects: ListLike
                             ) -> Tuple[ListLike, List[str]]:
    imgs = [get_image(data_object) for data_object in data_objects]

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
    imgs = [get_image(data_object) for data_object in data_objects]

    X, feature_names = resize_LDA(imgs, labels, statuses)

    for i, data_object in enumerate(data_objects):
        data_objects[i]['features'] = X[i].tolist()

    return data_objects, feature_names


def extract_features_text_NMF(data_objects: ListLike,
                              ) -> Tuple[ListLike, List[str]]:
    X = [data_object['content'] for data_object in data_objects]
    tfidf_vectorizer = TfidfVectorizer(max_df=0.95, min_df=2,
                                       max_features=5000,
                                       stop_words='english')
    X_tfidf = tfidf_vectorizer.fit_transform(X)
    n_components = 20
    nmf = NMF(n_components=n_components, init='random',
              random_state=0, alpha=.1, l1_ratio=.5)
    X_nmf = nmf.fit_transform(X_tfidf)

    for i, data_object in enumerate(data_objects):
        data_objects[i]['features'] = X_nmf[i].tolist()

    feature_names = [f'NMF[{i}]' for i in range(n_components)]

    return data_objects, feature_names


class FeatureExtractionHandler(tornado.web.RequestHandler):
    """
    The handler for feature extraction.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        if key not in ['image/SVD', 'image/BoW', 'image/LDA', 'text/NMF']:
            # The service is not found.
            self.send_error(404)
            return

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
        if key == 'text/NMF':
            data_objects, feature_names = extract_features_text_NMF(
                data_objects)

        self.write({
            'dataObjects': data_objects,
            'featureNames': feature_names,
        })
