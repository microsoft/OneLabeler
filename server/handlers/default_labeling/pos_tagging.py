from typing import List, TypedDict
import uuid

import nltk

from ..utils.data_labeling.types import Label, LabelSpan


class DataObject(TypedDict):
    """The data object type."""
    uuid: str
    content: str


def pos_tagging(sentence: str) -> List[LabelSpan]:
    pos_tag = nltk.pos_tag(sentence.split())
    start = 0
    end = 0
    spans = []
    for i, (segment, tag) in enumerate(pos_tag):
        start = end + 1 if i != 0 else end
        end = start + len(segment)
        if tag != 'CD':
            continue
        spans.append({
            'text': segment,
            'start': start,
            'end': end,
            # 'category': tag,
            'category': 'value',
            'uuid': str(uuid.uuid4()),
        })
    return spans


def get_default_label(data_objects: List[DataObject]) -> List[Label]:
    labels = [pos_tagging(d['content']) for d in data_objects]
    labels = [
        {'spans': d, 'uuid': data_objects[i]['uuid']}
        for i, d in enumerate(labels)
    ]
    return labels
