import { xor4096 } from 'seedrandom';
import {
  IDataObjectStorage,
  ProcessType,
} from '@/commons/types';

export default {
  type: ProcessType.FeatureExtraction,
  label: 'Random3D (Dummy)',
  id: 'Random-87333124',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['features'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ features: number[][] }> => {
    const { dataObjects, queryUuids } = inputs;
    const SEED = '20';
    const random = xor4096(SEED);

    const nPoints = queryUuids.length === 0
      ? await dataObjects.count()
      : queryUuids.length;
    const features = Array(nPoints).fill(null)
      .map(() => [random(), random(), random()]);
    return { features };
  },
};
