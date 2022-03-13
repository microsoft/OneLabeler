from typing import List, Tuple
import json

from tornado.web import RequestHandler

from ..types import DataObject
from .utils import get_image, resize_SVD


def extract_features(data_objects: List[DataObject]
                     ) -> Tuple[List[List[float]], List[str]]:
    imgs = [get_image(data_object) for data_object in data_objects]
    X, feature_names = resize_SVD(imgs)
    return X.tolist(), feature_names


class Handler(RequestHandler):
    """
    The handler for feature extraction - image SVD.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects)
        data_objects: List[DataObject] = json_data['dataObjects']

        features, feature_names = extract_features(data_objects)

        self.write({
            'features': features,
            'featureNames': feature_names,
        })
