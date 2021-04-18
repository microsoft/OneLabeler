import json

import numpy as np
from sklearn import decomposition, manifold
import tornado.web


class ProjectionHandler(tornado.web.RequestHandler):
    """
    The handler for image labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        assert key in ['PCA', 'MDS', 'TSNE'],\
            f'Invalid projection method {key}'

        X = json_data['X']
        X = np.array(X)
        n_components = json_data['nComponents']

        if X.shape[1] == n_components:
            projection = X.tolist()
        else:
            model = None
            if key == 'PCA':
                model = decomposition.TruncatedSVD(n_components=n_components)
            if key == 'MDS':
                model = manifold.MDS(n_components=n_components,
                                    n_init=1, max_iter=100, random_state=0)
            if key == 'TSNE':
                model = manifold.TSNE(n_components=n_components,
                                    init='pca', random_state=0)
            projection = model.fit_transform(X)
            projection = projection.tolist()

        self.write({'projection': projection})
