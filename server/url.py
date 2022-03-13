from tornado.web import RequestHandler
from handlers import (CompileHandler,
                      ModelTrainingHandler,
                      ImageProcessingHandler)

# Data object selection handlers:
from handlers.data_object_selection.cluster_centroids import Handler as DOSClusterCentroids
from handlers.data_object_selection.cluster import Handler as DOSCluster
from handlers.data_object_selection.dense_areas import Handler as DOSDenseAreas
from handlers.data_object_selection.entropy import Handler as DOSEntropy
from handlers.data_object_selection.least_confident import Handler as DOSLeastConfident
from handlers.data_object_selection.random import Handler as DOSRandom
from handlers.data_object_selection.smallest_margin import Handler as DOSSmallestMargin
# Default labeling handlers:
from handlers.default_labeling.model_prediction import Handler as DLModelPrediction
from handlers.default_labeling.null import Handler as DLNull
from handlers.default_labeling.pos_tagging import Handler as DLPosTagging
from handlers.default_labeling.random import Handler as DLRandom
# Feature extraction handlers:
from handlers.feature_extraction.image_bow import Handler as FEImageBow
from handlers.feature_extraction.image_lda import Handler as FEImageLda
from handlers.feature_extraction.image_svd import Handler as FEImageSvd
from handlers.feature_extraction.text_nmf import Handler as FETextNmf
# Projection handlers:
from handlers.projection.mds import Handler as ProjectionMDS
from handlers.projection.pca import Handler as ProjectionPCA
from handlers.projection.tsne import Handler as ProjectionTSNE


class RoundtripHandler(RequestHandler):
    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')


url = [
    # request for compiled exe package
    (r'/compile/(.*)', CompileHandler),

    # request for image processing algorithms
    (r'/imgproc/(.*)', ImageProcessingHandler),

    # request for features computed with features extraction algorithms
    (r'/features/image/BoW', FEImageBow),
    (r'/features/image/LDA', FEImageLda),
    (r'/features/image/SVD', FEImageSvd),
    (r'/features/text/NMF', FETextNmf),

    # request for selection computed with data object selection algorithms
    (r'/selection/ClusterCentroids', DOSClusterCentroids),
    (r'/selection/Cluster', DOSCluster),
    (r'/selection/DenseAreas', DOSDenseAreas),
    (r'/selection/Entropy', DOSEntropy),
    (r'/selection/LeastConfident', DOSLeastConfident),
    (r'/selection/Random', DOSRandom),
    (r'/selection/SmallestMargin', DOSSmallestMargin),

    # request for default labels computed with default labeling algorithms
    (r'/defaultLabels/ModelPrediction', DLModelPrediction),
    (r'/defaultLabels/Null', DLNull),
    (r'/defaultLabels/PosTagging', DLPosTagging),
    (r'/defaultLabels/Random', DLRandom),

    # request for projection computed with dimension reduction algorithms
    (r'/projection/MDS', ProjectionMDS),
    (r'/projection/PCA', ProjectionPCA),
    (r'/projection/TSNE', ProjectionTSNE),

    # request for updated model computed with interim model training algorithms
    (r'/modelUpdated/(.*)', ModelTrainingHandler),
    # request for roundtrip testing
    (r'/roundtrip', RoundtripHandler),
]
