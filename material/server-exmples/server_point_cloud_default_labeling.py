#!/usr/bin/env python
# coding:utf-8

import json

import numpy as np
import tornado.httpserver
import tornado.ioloop
import tornado.options
import tornado.web
from tornado.options import define, options

PATH = r'/defaultLabels'
PORT = 8006

def predict(points: np.ndarray,
            partial_labels: np.ndarray) -> np.ndarray:
    """
    Args
    ----
    points: np.ndarray, shape = (n_samples, 3)
        The coordinates of the points.
    partial_labels : np.ndarray, shape = (n_samples,)
        For labeled data points, store their labels.
        For unlabeled data points, store UNLABeLED as a mark.
    """
    
    '''
    Some computation.

    Baseline:
        # model is some pretrained model
        # by other point cloud segmentation related work.
        # can be achieved by running any existing model
        labels = model.predict(points)
    
    Better:
        labeled_indices = [i for i in range(partial_labels)
                           if labels[i] != 'UNLABELED']
        points_train = points[labeled_indices]
        labels_train = labels[labeled_indices]
        model = model.fit(points_train, labels_train)
        labels = model.predict(points)

    Ideally:
        model = model.fit(points, partial_labels)
        labels = model.predict(points)
    '''
    return labels

class DefaultLabelingHandler(tornado.web.RequestHandler):
    """
    The handler for feature extraction.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects, labels?, statuses?)
        points = np.array(json_data['points'])
        labels = np.array(json_data['labels'])
        
        '''
        Evoke prediction logic here:
        e.g.,
            labeled_indices = [i for i in range(labels) if labels[i] != 'UNLABELED']
            points_train = points[labeled_indices]
            labels_train = labels[labeled_indices]
            clf = model.fit(points_train, labels_train)
            labels = clf.predict(points)
        '''

        self.write({ 'labels': labels })


application = tornado.web.Application(
    handlers=[(PATH, DefaultLabelingHandler)],
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
