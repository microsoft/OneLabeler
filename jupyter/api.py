# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

import json
import requests
from typing import Any, List, NoReturn
import warnings

from IPython.display import IFrame


class OneLabeler():
    def __init__(self, frontend_url='http://localhost:8080',
                 socket_server_url='http://localhost:5000'):
        self.frontend_url = frontend_url
        self.socket_server_url = socket_server_url

    def display(self, width='100%', height='450') -> IFrame:
        return IFrame(self.frontend_url, width=width, height=height)

    def start_new_project(self, data_objects: List[Any]) -> NoReturn:
        data = json.dumps(data_objects)
        requests.post(f'{self.socket_server_url}/jupyter/startNewProject', data=data)

    def get_data_objects(self) -> List[Any]:
        r = requests.get(f'{self.socket_server_url}/jupyter/dataObjects')
        payload = r.json()
        message = payload['message']
        if message != 'SUCCESS':
            warnings.warn(message)
        data = payload['data']
        return data
    
    def set_data_objects(self, data_objects: List[Any]) -> List[Any]:
        data = json.dumps(data_objects)
        requests.put(f'{self.socket_server_url}/jupyter/dataObjects', data=data)

    def get_labels(self) -> List[Any]:
        r = requests.get(f'{self.socket_server_url}/jupyter/labels')
        payload = r.json()
        message = payload['message']
        if message != 'SUCCESS':
            warnings.warn(message)
        data = payload['data']
        return data

    def set_labels(self, labels: List[Any]) -> List[Any]:
        data = json.dumps(labels)
        requests.put(f'{self.socket_server_url}/jupyter/labels', data=data)
