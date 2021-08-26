import axios from 'axios';
import {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';
import VDisplay from './VDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

interface IBlock extends IDataObject {
  contour: [number, number][];
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

export default {
  type: 'MI3-block',
  tasks: [LabelTaskType.Classification],
  label: 'MI3 block',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    const content = await getBase64(file);
    const dataObjects: IBlock[] = (await axios.post(
      'http://localhost:8005/imgproc/discreteBarChart/candidateBlocks',
      JSON.stringify({ img: content }),
    )).data.blocks.map((d) => {
      const { uuid } = d;
      const contour = d.contour.map((p) => p[0]);
      const xMin = d.x_min;
      const yMin = d.y_min;
      const width = d.w_axis_aligned;
      const height = d.h_axis_aligned;
      return {
        uuid,
        contour,
        xMin,
        yMin,
        width,
        height,
        src: content,
      };
    });
    storage.upsertBulk(dataObjects);
  },
  handleExport: <T extends IDataObject>(
    dataObjects: T[],
    labels: ILabel[],
  ): IExport<T> => {
    const uuid2idxInLabels: Record<string, number> = {};
    labels.forEach((d: ILabel, i) => {
      uuid2idxInLabels[d.uuid] = i;
    });
    return dataObjects.map((d) => {
      const partial = {
        uuid: d.uuid,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: VDisplay,
} as IDataTypeSetup<UploadTarget.File>;
