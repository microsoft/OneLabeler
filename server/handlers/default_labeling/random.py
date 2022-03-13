import json
from typing import List

import numpy as np
from tornado.web import RequestHandler

from ..types import DataObject, Label


def get_default_label(uuids: List[str],
                      categories: List[str]) -> List[Label]:
    labels: List[str] = np.random.choice(
        np.array(categories, dtype=str),
        size=len(uuids),
        replace=True,
    ).tolist()
    labels = [
        {'category': d, 'uuid': uuids[i]}
        for i, d in enumerate(labels)
    ]
    return labels


class Handler(RequestHandler):
    """
    The handler for default labeling - random.
    """

    def post(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        json_data = json.loads(self.request.body)

        # input: (dataObjects, categories)
        data_objects: List[DataObject] = json_data['dataObjects']
        categories: List[str] = json_data['categories']

        uuids = [(d['uuid'] if 'uuid' in d else None) for d in data_objects]
        labels = get_default_label(uuids, categories)

        self.write({'labels': labels})
