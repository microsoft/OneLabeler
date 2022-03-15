# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json
from typing import List

import numpy as np
from tornado.web import RequestHandler

from .utils import random_sampling
from ..types import DataObject, Status


class Handler(RequestHandler):
    """
    The handler for data object selection - random.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # process input: (dataObjects, statues, nBatch)
        data_objects: List[DataObject] = json_data['dataObjects']
        statuses: List[Status] = json_data['statuses']
        n_batch: int = json_data['nBatch']

        # data structure transformation
        statuses = np.array([d['value'] for d in statuses], dtype=str)

        assert len(data_objects) == len(statuses),\
            'len(data_objects) != len(statuses)'

        query_indices = random_sampling(data_objects, statuses, n_batch)
        query_indices = query_indices.tolist()

        self.write({'queryIndices': query_indices})
