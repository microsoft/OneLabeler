from typing import List
import json

import tornado.web

from .utils.data_labeling.api import DataLabelingAPI


class DataLabelingHandler(tornado.web.RequestHandler):
    """
    The handler for image labeling.
    """

    def post(self, key: str):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)
        if key == 'extractFeatures':
            data_objects = json_data['dataObjects']
            data_objects, feature_names = DataLabelingAPI\
                .extract_features(data_objects)
            self.write({
                'dataObjects': data_objects,
                'featureNames': feature_names,
            })
        elif key == 'sampleDataObjects':
            data_objects = json_data['dataObjects']
            statuses = json_data['statuses']
            n_batch = json_data['nBatch']
            query_indices = DataLabelingAPI.sample_data_objects(
                data_objects, statuses, n_batch)
            self.write({'queryIndices': query_indices})
        elif key == 'assignDefaultLabels':
            data_objects = json_data['dataObjects']
            model = json_data['model']
            classes = json_data['classes']
            unlabeled_mark = json_data['unlabeledMark']
            default_labels = DataLabelingAPI.assign_default_labels(
                data_objects, model, classes, unlabeled_mark)
            self.write({'defaultLabels': default_labels})
        elif key == 'updateModel':
            data_objects = json_data['dataObjects']
            labels = json_data['labels']
            statuses = json_data['statuses']
            model = json_data['model']
            model_updated = DataLabelingAPI.update_model(
                data_objects, labels, statuses, model)
            self.write({'model': model_updated})
        else:
            raise ValueError(f'Invalid key: {key}')
        '''
        elif key == 'stoppageAnalysis':
            labels = json_data['labels']
            sample_rate = json_data['sampleRate']
            should_stop = DataLabelingAPI.stoppage_analysis(labels, sample_rate)
            self.write({'shouldStop': should_stop})
        '''
