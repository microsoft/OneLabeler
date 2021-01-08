from typing import Any, Dict, List, Tuple

import numpy as np

from .generic import GenericPipeline
from .pipeline import DataLabelingPipeline


class DataLabelingAPI(GenericPipeline):
    @staticmethod
    def sample_data_objects(data_objects: List[dict],
                            statuses: List[str],
                            n_batch: int) -> List[int]:
        assert len(data_objects) == len(statuses),\
            'len(data_objects) != len(statuses)'
        
        statuses = np.array(statuses)
        query_indices = DataLabelingPipeline.sample_data_objects(
            data_objects=data_objects,
            statuses=statuses,
            n_batch=n_batch
        )
        query_indices = query_indices.tolist()
        return query_indices

    @staticmethod
    def extract_features(
        data_objects: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        data_objects, feature_names = DataLabelingPipeline\
            .extract_features(data_objects)
        for data_object in data_objects:
            data_object['features'] = data_object['features'].tolist()
        return data_objects, feature_names

