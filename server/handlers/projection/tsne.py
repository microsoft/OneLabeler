import json

import numpy as np
from sklearn.manifold import TSNE
from tornado.web import RequestHandler


class Handler(RequestHandler):
    """
    The handler for projection - TSNE.
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
            model = TSNE(n_components=n_components,
                         init='pca', random_state=0)
            projection = model.fit_transform(X)
            projection = projection.tolist()

        self.write({'projection': projection})
