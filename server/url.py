from handlers import (DataLabelingHandler,
                      FeatureExtractionHandler,
                      DataObjectSelectionHandler,
                      DefaultLabelingHandler,
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
    (r'/features/(.*)', FeatureExtractionHandler),
    # request for data object selection algorithms
    (r'/selection/(.*)', DataObjectSelectionHandler),
    # request for default labeling algorithms
    (r'/defaultLabels/(.*)', DefaultLabelingHandler),
    # request for data labeling algorithms
    (r'/dataLabeling/(\w+)', DataLabelingHandler),
]
