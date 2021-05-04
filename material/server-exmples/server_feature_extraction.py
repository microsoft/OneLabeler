#!/usr/bin/env python
# coding:utf-8

import json

import cv2 as cv
import numpy as np
import requests
from sklearn import manifold
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options

PATH = r'/features/TSNE-2D'
PORT = 8006
IMG_SERVICE = 'http://localhost:8005/img'


class FeatureExtractionHandler(tornado.web.RequestHandler):
    """
    The handler for feature extraction.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects, labels?, statuses?)
        data_objects = json_data['dataObjects']

        if len(data_objects) == 0:
            self.write({
                'dataObjects': data_objects,
                'featureNames': ['TSNE-2D[0]', 'TSNE-2D[0]'],
            })
            return

        imgs = []
        for data_object in data_objects:
            path = data_object['path']
            r = requests.get(f'{IMG_SERVICE}/{path}', stream=True)
            img = cv.imdecode(np.frombuffer(r.content, np.uint8),
                              cv.IMREAD_COLOR)
            imgs.append(img)

        # normalized the images to gray scale 8 x 8
        h, w = 8, 8
        X_raw_normalized = []
        for img in imgs:
            img_gray = img if len(img.shape) == 2 else cv.cvtColor(
                img, cv.COLOR_BGR2GRAY)
            img_resized = cv.resize(
                img_gray, (h, w), interpolation=cv.INTER_AREA)
            X_raw_normalized.append(img_resized)
        X_raw_normalized = np.array(X_raw_normalized)
        X_flatten = X_raw_normalized.reshape((-1, h * w))

        n_components = 2
        n_samples, n_features = X_flatten.shape
        n_components_actual = min(n_samples, n_features, n_components)
        reducer = manifold.TSNE(n_components=n_components_actual,
                                init='pca', random_state=0)
        X = reducer.fit_transform(X_flatten)

        if n_components > n_components_actual:
            zeros = np.zeros((n_samples, n_components -
                              n_components_actual), dtype=float)
            X = np.hstack((X, zeros))

        feature_names = [f'TSNE-2D[{i}]' for i in range(n_components)]

        self.write({
            'dataObjects': data_objects,
            'featureNames': feature_names,
        })


application = tornado.web.Application(
    handlers=[(PATH, FeatureExtractionHandler)],
    debug=True,
)
define('port', default=PORT, help='run on th given port', type=int)


def main():
    tornado.options.parse_command_line()
    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(options.port)
    print('Development server is running at http://127.0.0.1:%s/' % options.port)
    print('Quit the server with Control-C')
    tornado.ioloop.IOLoop.instance().start()


if __name__ == "__main__":
    main()
