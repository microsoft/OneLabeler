import os

import tornado.web

UPLOAD_FOLDER_ROUTE = '.uploads/'


class UploadHandler(tornado.web.RequestHandler):
    """
    Handler for file upload.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')

        if not os.path.exists(UPLOAD_FOLDER_ROUTE):
            os.makedirs(UPLOAD_FOLDER_ROUTE)

        # server can be agnostic to the type of the uploaded file
        file_body = self.request.files['fileToUpload'][0]['body']
        path = UPLOAD_FOLDER_ROUTE + self.get_argument('fileName')
        with open(path, 'wb') as file:
            file.write(file_body)
            file.close()
        self.write({'path': path})
