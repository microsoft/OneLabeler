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
        if key == 'sampleDataObjects':
            data_objects = json_data['dataObjects']
            labels = json_data['labels']
            statuses = json_data['statuses']
            n_batch = json_data['nBatch']
            model = json_data['model']
            query_indices = DataLabelingAPI.sample_data_objects(
                data_objects, labels, statuses, n_batch, model)
            self.write({'queryIndices': query_indices})
        '''
        elif key == 'stoppageAnalysis':
            labels = json_data['labels']
            sample_rate = json_data['sampleRate']
            should_stop = DataLabelingAPI.stoppage_analysis(labels, sample_rate)
            self.write({'shouldStop': should_stop})
        '''
