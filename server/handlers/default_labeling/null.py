from typing import List

from ..utils.data_labeling.types import Label


def get_default_label(uuids: List[str],
                      unlabeled_mark: str,
                      n_samples: int) -> List[Label]:
    labels = [
        {'category': unlabeled_mark, 'uuid': uuids[i]}
        for i in range(n_samples)
    ]
    return labels
