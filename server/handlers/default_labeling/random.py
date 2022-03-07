from typing import List

import numpy as np

from ..utils.data_labeling.types import Label


def get_default_label(uuids: List[str],
                      categories: List[str],
                      n_samples: int) -> List[Label]:
    labels: List[str] = np.random.choice(
        categories,
        size=n_samples,
        replace=True,
    ).tolist()
    labels = [
        {'category': d, 'uuid': uuids[i]}
        for i, d in enumerate(labels)
    ]
    return labels
