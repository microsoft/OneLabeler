import json

import numpy as np
import tornado.web

from .null import get_default_label as default_label_null
from .random import get_default_label as default_label_random
from .pos_tagging import get_default_label as default_label_pos_tagging
from .pointnet_segmentation import get_default_label as default_label_pointnet_segmentation
from .model_prediction import get_default_label as default_label_model_prediction


class DefaultLabelingHandler(tornado.web.RequestHandler):
    """
    The handler for default labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        if key not in ['Null', 'Random', 'ModelPrediction', 'POS-tagging', 'PointNet-segmentation']:
            # The service is not found.
            self.send_error(404)
            return

        # process input: (dataObjects, model, categories?, unlabeledMark?)
        # note: categories are required to be strings
        data_objects = json_data['dataObjects']
        model = json_data['model']\
            if 'model' in json_data else None
        categories = np.array(json_data['categories'], dtype=str)\
            if 'categories' in json_data else None
        unlabeled_mark = json_data['unlabeledMark']\
            if 'unlabeledMark' in json_data else None

        uuids = [(d['uuid'] if 'uuid' in d else None) for d in data_objects]
        features = np.array([(d['features'] if 'features' in d else None)
                             for d in data_objects])
        n_samples = len(features)

        if key == 'Null':
            labels = default_label_null(uuids, unlabeled_mark, n_samples)
        if key == 'Random':
            labels = default_label_random(uuids, categories, n_samples)
        if key == 'ModelPrediction':
            labels = default_label_model_prediction(
                model, features, uuids, categories, unlabeled_mark)
        if key == 'POS-tagging':
            labels = default_label_pos_tagging(data_objects)
        if key == 'PointNet-segmentation':
            labels = default_label_pointnet_segmentation(data_objects)

        self.write({'labels': labels})
