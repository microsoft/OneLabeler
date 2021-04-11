from typing import NamedTuple, Union

from sklearn.base import BaseEstimator

"""The label type."""
Label = str

class Status():
    """The label status of a data object."""
    # pylint: disable=too-few-public-methods

    NEW = 'NEW'  # the data object is not viewed and not labeled
    VIEWED = 'VIEWED'  # the data object is viewed but not yet labeled
    SKIPPED = 'SKIPPED'  # the data object is viewed but skipped
    LABELED = 'LABELED'  # the data object is labeled

class DefaultLabelingMethodType():
    """The type of a default labeling method."""
    # pylint: disable=too-few-public-methods
    
    Null = 'Null'
    Random = 'Random'
    DecisionTree = 'DecisionTree'
    SVM = 'SVM'
    LogisticRegression = 'LogisticRegression'
    LabelSpreading = 'LabelSpreading'
    RestrictedBoltzmannMachine = 'RestrictedBoltzmannMachine'

class SamplingStrategyType():
    """The type of a sampling strategy."""
    # pylint: disable=too-few-public-methods

    Random = 'Random'
    ClusterCentroids = 'ClusterCentroids'
    DenseAreas = 'DenseAreas'
    Entropy = 'Entropy'
    EntropyDiversity = 'EntropyDiversity'
    EntropyDiversityDensity = 'EntropyDiversityDensity'
    LeastConfident = 'LeastConfident'
    SmallestMargin = 'SmallestMargin'

class Model(NamedTuple):
    """
    The default labeling and active sampling model.
    
    Attributes
    ----------
    predictor : Union[BaseEstimator, None]
        The part of the model responsible for prediction.
    sampler : Union[BaseEstimator, None]
        The part of the model responsible for sampling.
        The predictor and sampler can possibly refer to the same estimator,
        if it can serve both purposes.
    """

    type: DefaultLabelingMethodType
    sampling_strategy: SamplingStrategyType
    predictor: Union[BaseEstimator, None]
    sampler: Union[BaseEstimator, None]
