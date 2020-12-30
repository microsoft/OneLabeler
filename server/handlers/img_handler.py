import os

import tornado.web

IMG_ROUTE = '.uploads/'


class ImgHandler(tornado.web.RequestHandler):
    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')

        if not os.path.exists(IMG_ROUTE):
            os.makedirs(IMG_ROUTE)

        file_body = self.request.files['fileToUpload'][0]['body']
        imgPath = IMG_ROUTE + self.get_argument('fileName')
        with open(imgPath, 'wb') as file:
            file.write(file_body)
            file.close()
        self.write({'imgPath': imgPath})
