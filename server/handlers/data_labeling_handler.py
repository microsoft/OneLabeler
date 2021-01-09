import json

import tornado.web

from .algorithms.data_labeling.api import DataLabelingAPI


class DataLabelingHandler(tornado.web.RequestHandler):
    """
    The handler for image labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)
        if key == 'sampleDataObjects':
            data_objects = json_data['dataObjects']
            statuses = json_data['statuses']
            n_batch = json_data['nBatch']
            query_indices = DataLabelingAPI.sample_data_objects(
                data_objects, statuses, n_batch)
            self.write({'queryIndices': query_indices})
        elif key == 'extractFeatures':
            data_objects = json_data['dataObjects']
            data_objects, feature_names = DataLabelingAPI\
                .extract_features(data_objects)
            self.write({
                'dataObjects': data_objects,
                'featureNames': feature_names,
            })
        else:
            raise ValueError(f'Invalid key: {key}')
        '''
        elif key == 'stoppageAnalysis':
            labels = json_data['labels']
            sample_rate = json_data['sampleRate']
            should_stop = DataLabelingAPI.stoppage_analysis(labels, sample_rate)
            self.write({'shouldStop': should_stop})
        elif key == 'getDefaultLabels':
            images = json_data['images']
            selection = json_data['selection']
            default_labeling_method = json_data['defaultLabelingMethod']
            ml_method = json_data['MLMethod']
            clf = json_data['clf'] if 'clf' in json_data else None
            y_pred_serialized = DataLabelingAPI.get_default_labels(
                images, selection, default_labeling_method, ml_method, clf)
            self.write({'yPred': y_pred_serialized})
        elif key == 'updateClassifier':
            images = json_data['images']
            ml_method = json_data['MLMethod']
            clf = json_data['clf'] if 'clf' in json_data else None
            clf_serialized = DataLabelingAPI.update_classifier(
                images, ml_method, clf)
            self.write({'clf': clf_serialized})
        else:
            raise ValueError(f'Invalid key: {key}')
        '''
