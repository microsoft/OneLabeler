import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  IAudio,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';
import VDisplay from './VDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

const getAudioSize = (content: string) => new Promise((resolve) => {
  const video = document.createElement('video');
  video.addEventListener('loadedmetadata', function () {
    resolve({ duration: this.duration });
  }, false);
  video.src = content;
}) as Promise<{ duration: number }>;

export default {
  type: DataType.Audio,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.SpanClassification,
  ],
  label: 'audio',
  importType: UploadTarget.Folder,
  handleImport: async (input: FileList, storage: IDataObjectStorage) => {
    const files = input as FileList;
    await Promise.all([...files].map(async (file) => {
      const content = await getBase64(file);
      const { duration } = await getAudioSize(content);
      const dataObject: IAudio = {
        uuid: uuidv4(),
        content,
        duration,
      };
      storage.upsert(dataObject);
    }));
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
} as IDataTypeSetup<UploadTarget.Folder>;
