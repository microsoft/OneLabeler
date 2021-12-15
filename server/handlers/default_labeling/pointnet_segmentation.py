from typing import List, TypedDict, Tuple

import numpy as np
import torch
from ..utils.pointnet import PointNetSeg

from ..utils.data_labeling.types import Label


class DataObject(TypedDict):
    """The data object type."""
    uuid: str
    content: List[Tuple[float, float, float]]


device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
pointnet = PointNetSeg()

# Note: the pretrained model is for airplane segmentation with 4 categories
# 0: wing, 1: body, 2: tail, 3: engine
path = './handlers/utils/pointnet/seg_model'
pointnet.load_state_dict(torch.load(path, map_location=device))
labelmap = ['wing', 'body', 'tail', 'engine']

def pointnet_segmentation(batch: List) -> List[List[str]]:
    """
    For each data object (i.e., point cloud),
    get a list of labels corresponding to point segmentation labels
    """

    # TODO: the current model only allow batch size > 1
    # need to figure out why this restriction exists

    pred = pointnet(torch.tensor(batch).transpose(1, 2))

    # shape: (n_data_objects, n_points)
    pred_np = np.array(torch.argmax(pred[0], 1))
    pred_list = pred_np.tolist()
    pred_list_str = [[labelmap[label] for label in point_labels] for point_labels in pred_list]
    return pred_list_str


def get_default_label(data_objects: List[DataObject]) -> List[Label]:
    points_batch = [data_object['content'] for data_object in data_objects]
    labels = pointnet_segmentation(points_batch)
    labels = [
        { 'pointLabels': d, 'uuid': data_objects[i]['uuid']}
        for i, d in enumerate(labels)
    ]
    return labels
