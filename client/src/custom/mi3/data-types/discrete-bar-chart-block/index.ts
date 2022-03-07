import axios from 'axios';
import { LabelTaskType, UploadTarget } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

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
      // TODO: the image src is duplicated in all the data object, which is unnecessary
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
    const uuid2idxInLabels = Object.fromEntries(
      labels.map((d, i) => [d.uuid, i]),
    );
    return dataObjects.map((d) => {
      const partial = {
        uuid: d.uuid,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: BaseDisplay,
} as IDataTypeSetup<UploadTarget.File>;
