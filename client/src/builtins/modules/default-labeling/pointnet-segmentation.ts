import {
  DataType,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

export default {
  type: ModuleType.DefaultLabeling,
  label: 'PointNet-segmentation',
  id: 'PointNet-segmentation-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  isBuiltIn: true,
  isServerless: false,
  api: `${ALGORITHM_URL}/defaultLabels/PointNet-segmentation`,
  dataTypes: [DataType.PointCloud],
  labelTasks: [LabelTaskType.Segmentation3d],
};
