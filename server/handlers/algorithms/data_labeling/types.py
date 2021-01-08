class Status():
    """The label status of a data object."""
    # pylint: disable=too-few-public-methods

    NEW = 'NEW'  # the data object is not viewed and not labeled
    VIEWED = 'VIEWED'  # the data object is viewed but not yet labeled
    SKIPPED = 'SKIPPED'  # the data object is viewed but skipped
    LABELED = 'LABELED'  # the data object is labeled
