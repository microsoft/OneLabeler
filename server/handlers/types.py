# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.

from typing import List, TypedDict, Optional


class DataObject(TypedDict):
    """The data object type."""
    uuid: str
    features: Optional[List[float]]


class Model(TypedDict):
    """The model type."""
    type: str
    objectId: str


class LabelSpan(TypedDict):
    """The label span type."""
    text: str
    start: int
    end: int
    category: str
    uuid: str


class Label(TypedDict):
    """The label type."""
    uuid: str
    category: Optional[str]
    spans: Optional[List[LabelSpan]]
    pointLabels: Optional[List[str]]


class StatusType():
    """The range of status value."""
    # pylint: disable=too-few-public-methods

    New = 'New'  # the data object is not viewed and not labeled
    Viewed = 'Viewed'  # the data object is viewed but not yet labeled
    Skipped = 'Skipped'  # the data object is viewed but skipped
    Labeled = 'Labeled'  # the data object is labeled


class Status(TypedDict):
    """The label status of a data object."""
    uuid: str
    value: StatusType


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
