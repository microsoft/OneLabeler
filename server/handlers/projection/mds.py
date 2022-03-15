# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json

import numpy as np
from sklearn.manifold import MDS
from tornado.web import RequestHandler


class Handler(RequestHandler):
    """
    The handler for projection - MDS.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        X = json_data['X']
        n_components = json_data['nComponents']

        X = np.array(X)

        if X.shape[1] == n_components:
            projection = X.tolist()
        else:
            model = MDS(n_components=n_components,
                                 n_init=1, max_iter=100, random_state=0)
            projection = model.fit_transform(X)
            projection = projection.tolist()

        self.write({'projection': projection})
