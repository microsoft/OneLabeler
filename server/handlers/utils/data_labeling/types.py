from typing import NamedTuple, Union

from sklearn.base import BaseEstimator

"""The label type."""
Label = str

class Status():
    """The label status of a data object."""
    # pylint: disable=too-few-public-methods

    New = 'New'  # the data object is not viewed and not labeled
    Viewed = 'Viewed'  # the data object is viewed but not yet labeled
    Skipped = 'Skipped'  # the data object is viewed but skipped
    Labeled = 'Labeled'  # the data object is labeled

class BuiltInModelType():
    """The type of a default labeling method."""
    # pylint: disable=too-few-public-methods
    
    Null = 'Null'
    Random = 'Random'
    DecisionTree = 'DecisionTree'
    SVM = 'SVM'
    LogisticRegression = 'LogisticRegression'
    LabelSpreading = 'LabelSpreading'
    RestrictedBoltzmannMachine = 'RestrictedBoltzmannMachine'

class BuiltInSamplingStrategyType():
    """The type of a sampling strategy."""
    # pylint: disable=too-few-public-methods

    Random = 'Random'
    Cluster = 'Cluster'
    DenseAreas = 'DenseAreas'
    ClusterCentroids = 'ClusterCentroids'
    Entropy = 'Entropy'
    EntropyDiversity = 'EntropyDiversity'
    EntropyDiversityDensity = 'EntropyDiversityDensity'
    LeastConfident = 'LeastConfident'
    SmallestMargin = 'SmallestMargin'
