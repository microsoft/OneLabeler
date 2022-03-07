import axios from 'axios';
import { ModuleType, ILabelStorage } from '@/commons/types';

const URL = 'https://service-mpafvzs4-1302880393.gz.apigw.tencentcs.com/release/UploadFileToCOSByAPIGW-1625573665';

export default {
  type: ModuleType.Base,
  label: 'Save Labels',
  id: 'SaveLabels',
  inputs: ['labels'],
  outputs: [],
  isBuiltIn: true,
  isServerless: true,
  run: async (inputs: { labels: ILabelStorage }): Promise<void> => {
    const labels = await inputs.labels.getAll();
    await axios.post(URL, JSON.stringify({ labels }));
  },
};
