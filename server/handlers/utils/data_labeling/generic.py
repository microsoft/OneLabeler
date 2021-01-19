"""
The implementation of the generic MI3 pipeline.
"""

from abc import abstractmethod, ABCMeta
from typing import List, NoReturn, Optional, Tuple

import numpy as np


class GenericPipeline(metaclass=ABCMeta):
    """
    The generic MI3 pipeline.
    """

    @staticmethod
    @abstractmethod
    def extract_data_objects() -> List:
        """
        Extract data objects from the data source.

        Workflow Component - Data Object Extraction

        Returns
        -------
        data_objects : List
            The data objects extracted from the data source.

        Notes
        -----
        The preprocessing for getting data objects is application dependent.
        This function should be overridden differently for applications.
        """

    @staticmethod
    @abstractmethod
    def extract_features(data_objects: List) -> List:
        """
        Extract features for data objects.

        Workflow Component - Feature Extraction

        Args
        ----
        data_objects : List
            The data objects for which the features are to be extracted.

        Returns
        -------
        data_objects : List
            The data objects with extracted features.
        """

    @staticmethod
    @abstractmethod
    def sample_data_objects(data_objects: List,
                            statuses: List,
                            n_batch: int) -> np.ndarray:
        """
        Sample a batch of data objects from the pool of data objects.

        Workflow Component - Data Object Sampling (Algorithmic)

        Args
        ----
        data_objects : List
            The pool of data objects to be sampled from.
            Note that some data objects may be labeled.
        statuses : List
            The label status of the data objects.
        n_batch : int
            The number of data objects to sample.

        Returns
        -------
        query_indices : np.ndarray of int values
            The indices of selected data objects.
        """

    @staticmethod
    def assign_default_labels(data_objects: List,
                              model: dict) -> np.ndarray:
        """
        Assign default labels to the selected data objects.

        Workflow Component - Default Labeling

        Args
        ----
        data_objects : List
            The data objects to be assigned default labels.
        model : dict
            The default labeling model.

        Returns
        -------
        default_labels : np.ndarray of string/int/boolean values
            The default labels of the selected data objects.
        """

    @staticmethod
    def update_model(data_objects: List,
                     labels: np.ndarray,
                     statuses: np.ndarray,
                     model: dict) -> dict:
        """
        Update the default labeling and active sampling model
        with the partially user-labeled data object set.

        Args
        ----
        data_objects : List
            The data object for some of which
            labels are given by the user.
        labels : np.ndarray
            The labels of data objects.
        statuses : np.ndarray
            The label status of the data objects.
        model : dict
            The default labeling and active sampling model.

        Returns
        -------
        model_updated : dict
            The updated model.
        """

    '''
    @staticmethod
    def stoppage_analysis(labels: np.array, sample_rate: float) -> bool:
        """
        Check whether the active learning process should stop.

        Args
        ----
        labels : np.ndarray
            The labels of all the data points.
        sample_rate : float
            The desired rate of data points to be manually labeled.

        Returns
        -------
        should_stop : bool
            Whether the active learning process should stop.
        """

    @staticmethod
    @abstractmethod
    def update_labeled_dataset():
        """
        The module for adding user labeling to labeled dataset.
        """
        return
    '''
