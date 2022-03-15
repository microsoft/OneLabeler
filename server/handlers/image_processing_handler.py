# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

"""
TODO: implement the image processing algorithms for image labeling tasks.
"""

import json

import cv2 as cv
from tornado.web import RequestHandler

class ImageProcessingHandler(RequestHandler):
    """
    The handler for image labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        assert key in [
            'scissor/graphCut',
            'scissor/grabCut',
            'scissor/morphSnakes',
            'superpixel/slic',
            'superpixel/watershed',
            'superpixel/square',
            'superpixel/felzenszwalb',
        ], f'Invalid projection method {key}'

        path = json_data['path']
        img = cv.imread(path)

        if key == 'scissor/graphCut':
            pass
        if key == 'scissor/grabCut':
            pass
        if key == 'scissor/morphSnakes':
            pass
        if key == 'superpixel/slic':
            pass
        if key == 'superpixel/watershed':
            pass
        if key == 'superpixel/square':
            pass
        if key == 'superpixel/felzenszwalb':
            pass
