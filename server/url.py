from handlers import (DataLabelingHandler,
                      FeatureExtractionHandler,
                      DataObjectSelectionHandler,
                      DefaultLabelingHandler,
                      InterimModelTrainingHandler,
                      ImageHandler,
                      ProjectionHandler,
                      UploadHandler)

url = [
    # request for file upload
    (r'/uploadFile', UploadHandler),
    # request for image resource
    (r'/img/(.+)', ImageHandler),
    # request for projection computed with dimension reduction algorithms
    (r'/projection/(\w+)', ProjectionHandler),
    # request for features computed with features extraction algorithms
    (r'/features/(.*)', FeatureExtractionHandler),
    # request for selection computed with data object selection algorithms
    (r'/selection/(.*)', DataObjectSelectionHandler),
    # request for default labels computed with default labeling algorithms
    (r'/defaultLabels/(.*)', DefaultLabelingHandler),
    # request for updated model computed with interim model training algorithms
    (r'/modelUpdated/(.*)', InterimModelTrainingHandler),
    # request for data labeling algorithms
    (r'/dataLabeling/(\w+)', DataLabelingHandler),
]
