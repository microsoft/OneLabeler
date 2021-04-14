from handlers import (DataLabelingHandler,
                      FeatureExtractionHandler,
                      ImageHandler,
                      ProjectionHandler,
                      UploadHandler)

url = [
    # request for file upload
    (r'/uploadFile', UploadHandler),
    # request for image resource
    (r'/img/(.+)', ImageHandler),
    # request for projection algorithms
    (r'/projection/(\w+)', ProjectionHandler),
    # request for feature extraction algorithms
    (r'/extractFeatures/(.*)', FeatureExtractionHandler),
    # request for data labeling algorithms
    (r'/dataLabeling/(\w+)', DataLabelingHandler),
]
