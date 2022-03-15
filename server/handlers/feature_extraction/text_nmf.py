# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import List, Tuple
import json

from tornado.web import RequestHandler
from sklearn.decomposition import NMF
from sklearn.feature_extraction.text import TfidfVectorizer

from ..types import DataObject


def extract_features(data_objects: List[DataObject],
                     ) -> Tuple[List[List[float]], List[str]]:
    X = [data_object['content'] for data_object in data_objects]
    tfidf_vectorizer = TfidfVectorizer(max_df=0.95,
                                       min_df=2,
                                       max_features=5000,
                                       stop_words='english')
    X_tfidf = tfidf_vectorizer.fit_transform(X)
    n_components = 20
    nmf = NMF(n_components=n_components,
              init='random',
              random_state=0,
              alpha=.1,
              l1_ratio=.5)
    X_nmf = nmf.fit_transform(X_tfidf)
    feature_names = [f'NMF[{i}]' for i in range(n_components)]
    return X_nmf.tolist(), feature_names


class Handler(RequestHandler):
    """
    The handler for feature extraction - text NMF.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects)
        data_objects: List[DataObject] = json_data['dataObjects']

        features, feature_names = extract_features(data_objects)

        self.write({
            'features': features,
            'featureNames': feature_names,
        })
