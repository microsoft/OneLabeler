from typing import Any, Dict, List, Optional, Tuple, Union

from bson.objectid import ObjectId
import numpy as np

from ..data_persistence import save, load
from .generic import GenericPipeline
from .pipeline import DataLabelingPipeline
from .types import Label, Model


class DataLabelingAPI(GenericPipeline):
    @staticmethod
    def sample_data_objects(data_objects: List[dict],
                            labels: List[Label],
                            statuses: List[str],
                            n_batch: int,
                            model: Dict[str, Any]) -> List[int]:
        assert len(data_objects) == len(statuses),\
            'len(data_objects) != len(statuses)'
        statuses = np.array(statuses, dtype=str)
        predictor = load(ObjectId(model['predictor']))\
            if model['predictor'] is not None else None
        sampler = load(ObjectId(model['sampler']))\
            if model['sampler'] is not None else None
        model = Model(
            type=model['type'],
            sampling_strategy=model['samplingStrategy'],
            predictor=predictor,
            sampler=sampler,
        )
        query_indices = DataLabelingPipeline.sample_data_objects(
            data_objects=data_objects,
            labels=labels,
            statuses=statuses,
            n_batch=n_batch,
            model=model,
        )
        query_indices = query_indices.tolist()
        return query_indices
