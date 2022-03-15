# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json
from typing import List

from tornado.web import RequestHandler

from ..types import DataObject, Label


def get_default_label(uuids: List[str],
                      unlabeled_mark: str) -> List[Label]:
    labels = [
        {'category': unlabeled_mark, 'uuid': uuids[i]}
        for i in range(len(uuids))
    ]
    return labels


class Handler(RequestHandler):
    """
    The handler for default labeling - null.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # input: (dataObjects, unlabeledMark)
        # note: categories are required to be strings
        data_objects: List[DataObject] = json_data['dataObjects']
        unlabeled_mark: str = json_data['unlabeledMark']

        uuids = [(d['uuid'] if 'uuid' in d else None) for d in data_objects]
        labels = get_default_label(uuids, unlabeled_mark)

        self.write({'labels': labels})
