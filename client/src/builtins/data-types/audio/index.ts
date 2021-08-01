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
  const audio = document.createElement('audio');
  audio.addEventListener('loadedmetadata', function () {
    const { duration } = this;
    // Force the audio element to be cleaned up.
    audio.src = '';
    audio.remove();
    resolve({ duration });
  }, false);
  audio.src = content;
}) as Promise<{ duration: number }>;

const handleFile = async (
  file: File,
  storage: IDataObjectStorage,
): Promise<void> => {
  const content = await getBase64(file);
  const { duration } = await getAudioSize(content);
  const dataObject: IAudio = {
    uuid: uuidv4(),
    content,
    duration,
  };
  storage.upsert(dataObject);
};

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
  handleImport: async (
    files: FileList,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    // Note: chrome allow maximum 75 media elements to coexist,
    // thus a maximal 75 concurrent calls to getVideoSize can exist
    const concurrency = 50;
    const fs: (() => Promise<void>)[] = [...files]
      .map((file) => (() => handleFile(file, storage)));
    while (fs.length) await Promise.all(fs.splice(0, concurrency).map(f => f()));
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
