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

        Workflow Component - Data Object Sampling

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
    def get_default_labels(items: List,
                           selection: np.ndarray) -> np.ndarray:
        """
        Get default labels for the sampled data points.

        Args
        ----
        items : List
            The whole set of data objects the selection came from.
        selection : int
            The indices of selected data objects
            in the whole set of data objects.
        default_labeling_method : str
            The default labeling method to use.
        ml_method : str
            The ML method used.
        clf : BaseEstimator or None
            The interim classifier.

        Returns
        -------
        y_pred : np.ndarray of int values
            The predicted default labels of the data objects.
        """
        # pylint: disable=invalid-name

        X = np.array([item.features_normalized
                      for i, item in enumerate(items) if i in selection])
        y_pred = predict(X, ml_method, default_labeling_method, clf)
        return y_pred

    @staticmethod
    @abstractmethod
    def update_labeled_dataset():
        """
        The module for adding user labeling to labeled dataset.
        """
        return

    @staticmethod
    def update_classifier(items: List,
                          ml_method: str,
                          clf: Optional[BaseEstimator] = None) -> BaseEstimator:
        """
        Update the classifier with the
        partially user-labeled data object set.

        Args
        ----
        items : List
            The data object for some of which labels are updated by the user.
        ml_method : str
            The ML method to be used.
        clf : str or dict or None
            The previous interim model

        Returns
        -------
        clf : BaseEstimator
            The updated classifier.
        """
        # pylint: disable=invalid-name

        X = np.array([item.features_normalized for item in items])
        y = np.array([item.y_true for item in items])
        clf = update_clf(ml_method, clf, X, y)
        return clf

    @staticmethod
    @abstractmethod
    def apply_classifier():
        """
        The module for applying classifier.

        Notes
        -----
        The apply_classifier module is expected to behave
        similarly as get_default_labels.
        """
        return
    '''
