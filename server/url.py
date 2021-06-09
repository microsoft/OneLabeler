from handlers import (FeatureExtractionHandler,
                      DataObjectSelectionHandler,
                      DefaultLabelingHandler,
                      InterimModelTrainingHandler,
                      ImageProcessingHandler,
                      ProjectionHandler)

url = [
    # request for projection computed with dimension reduction algorithms
    (r'/projection/(\w+)', ProjectionHandler),
    # request for image processing algorithms
    (r'/imgproc/(.*)', ImageProcessingHandler),
    # request for features computed with features extraction algorithms
    (r'/features/(.*)', FeatureExtractionHandler),
    # request for selection computed with data object selection algorithms
    (r'/selection/(.*)', DataObjectSelectionHandler),
    # request for default labels computed with default labeling algorithms
    (r'/defaultLabels/(.*)', DefaultLabelingHandler),
    # request for updated model computed with interim model training algorithms
    (r'/modelUpdated/(.*)', InterimModelTrainingHandler),
]
