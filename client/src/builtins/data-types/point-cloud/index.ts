import { v4 as uuidv4 } from 'uuid';
import * as hdf5 from 'jsfive';
import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  IPointCloud,
  LabelTaskType,
  UploadTarget,
  Vector3d,
} from '@/commons/types';
import VDisplay from './VDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

const toMatrix = <T>(arr: T[], width: number) => arr.reduce(
  (rows: T[][], entry: T, index: number) => {
    if (index % width === 0) {
      rows.push([entry]);
    } else {
      rows[rows.length - 1].push(entry);
    }
    return rows;
  }, [],
);

export default {
  type: DataType.PointCloud,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
  ],
  label: 'point cloud',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = (evt) => {
        if (evt.target === null) return;
        const buffer = evt.target.result as ArrayBuffer;
        const f = new hdf5.File(buffer, '');
        const data = f.get('data');
        const { shape, value } = data;

        const [nDataObjects, nPoints, nDims] = shape;
        const length = nPoints * nDims;
        for (let i = 0; i < nDataObjects; i += 1) {
          const points = toMatrix(value.slice(length * i, length * i + length), nDims) as Vector3d[];
          const dataObject: IPointCloud = {
            uuid: uuidv4(),
            content: points,
          };
          storage.upsert(dataObject);
        }
        resolve(storage);
      };
      reader.readAsArrayBuffer(file);
    });
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
        url: d.url,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: VDisplay,
} as IDataTypeSetup<UploadTarget.File>;
