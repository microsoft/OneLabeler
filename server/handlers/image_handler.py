import os

import cv2 as cv
import tornado.web


class ImageHandler(tornado.web.RequestHandler):
    """
    Handler for image fetching.
    """

    def get(self, key: str):
        """
        Args
        ----
        key : str
            The path to the image.
        """

        self.set_header('Access-Control-Allow-Origin', '*')

        path = key
        filename_extension = path.split('.')[-1]

        assert filename_extension in ['png', 'jpg', 'jpeg'],\
            'unsupported file name extension'

        # send the file as byte stream
        with open(path, 'rb') as f:
            self.write(f.read())
