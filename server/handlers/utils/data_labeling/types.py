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

class DefaultLabelingModelType():
    """The type of a default labeling model."""
    # pylint: disable=too-few-public-methods
    
    Null = 'Null'
    Random = 'Random'
    DecisionTree = 'DecisionTree'
    SVM = 'SVM'
    LogisticRegression = 'LogisticRegression'
    LabelSpreading = 'LabelSpreading'
    RestrictedBoltzmannMachine = 'RestrictedBoltzmannMachine'

class Model(NamedTuple):
    """The default labeling and active sampling model."""

    type: DefaultLabelingModelType
    content: Union[BaseEstimator, None]
