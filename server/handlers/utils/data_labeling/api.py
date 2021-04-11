from typing import Any, Dict, List, Tuple, Union

from bson.objectid import ObjectId
import numpy as np

from ..data_persistence import save, load
from .generic import GenericPipeline
from .pipeline import DataLabelingPipeline
from .types import Label, Model


class DataLabelingAPI(GenericPipeline):
    @staticmethod
    def extract_features(
        data_objects: List[Dict[str, Any]],
        feature_extraction_method: str,
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        data_objects, feature_names = DataLabelingPipeline\
            .extract_features(data_objects, feature_extraction_method)
        for data_object in data_objects:
            data_object['features'] = data_object['features'].tolist()
        return data_objects, feature_names

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

    @staticmethod
    def assign_default_labels(data_objects: List[dict],
                              model: Dict[str, Any],
                              classes: List[Label],
                              unlabeled_mark: Label) -> List[Label]:
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
        # Labels are required to be strings.
        classes = np.array(classes, dtype=str)
        default_labels = DataLabelingPipeline.assign_default_labels(
            data_objects=data_objects,
            model=model,
            classes=classes,
            unlabeled_mark=unlabeled_mark,
        )
        default_labels = default_labels.tolist()
        return default_labels

    @staticmethod
    def update_model(data_objects: List[dict],
                     labels: List[Label],
                     statuses: List[str],
                     model: Dict[str, Any]) -> Dict[str, str]:
        # Labels are required to be strings.
        labels = np.array(labels, dtype=str)
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
        model_updated = DataLabelingPipeline.update_model(
            data_objects=data_objects,
            labels=labels,
            statuses=statuses,
            model=model,
        )
        predictor_details = save(data=model_updated.predictor)
        sampler_details = save(data=model_updated.sampler)
        model_updated = {
            'type': model_updated.type,
            'samplingStrategy': model_updated.sampling_strategy,
            'predictor': str(predictor_details['inserted_id']),
            'sampler': str(sampler_details['inserted_id']),
        }
        return model_updated
