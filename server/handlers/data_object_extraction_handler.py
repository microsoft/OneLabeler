import os

import cv2 as cv
import numpy as np
import tornado.web

UPLOAD_FOLDER_ROUTE = '.uploads/'

class DataObjectExtractionHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')

        assert key in ['image']

        if key == 'image':
            if not os.path.exists(UPLOAD_FOLDER_ROUTE):
                os.makedirs(UPLOAD_FOLDER_ROUTE)

            # server can be agnostic to the type of the uploaded file
            file_body = self.request.files['fileToUpload'][0]['body']
            
            img = cv.imdecode(np.frombuffer(file_body, np.uint8),
                            cv.IMREAD_COLOR)
            h = img.shape[0]
            w = img.shape[1]

            path = UPLOAD_FOLDER_ROUTE + self.get_argument('fileName')
            with open(path, 'wb') as f:
                f.write(file_body)
                f.close()
            self.write({'path': path, 'width': w, 'height': h})
