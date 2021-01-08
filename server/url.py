from handlers import (DataLabelingHandler,
                      ImageHandler,
                      UploadHandler)

url = [
    # request for file upload
    (r'/uploadFile', UploadHandler),
    # request for image resource
    (r'/img/(.+)', ImageHandler),
    # request for data labeling algorithms
    (r'/dataLabeling/(\w+)', DataLabelingHandler),
]
