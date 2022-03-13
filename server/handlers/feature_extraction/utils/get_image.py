import base64

import cv2 as cv
import numpy as np

from ...types import DataObject

def get_image(data_object: DataObject) -> np.ndarray:
    data_url = data_object['content']
    base64str = data_url.split('base64,', 1)[1]
    img_arr = np.fromstring(base64.b64decode(base64str), np.uint8)
    img = cv.imdecode(img_arr, cv.IMREAD_COLOR)
    return img
