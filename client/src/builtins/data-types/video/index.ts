import { v4 as uuidv4 } from 'uuid';
import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  IVideo,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { getBase64 } from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

const getVideoSize = (content: string) => new Promise((resolve) => {
  const video = document.createElement('video');
  video.addEventListener('loadedmetadata', function () {
    const height = this.videoHeight;
    const width = this.videoWidth;
    const { duration } = this;
    // Force the video element to be cleaned up.
    video.src = '';
    video.remove();
    resolve({ height, width, duration });
  }, false);
  video.src = content;
}) as Promise<{
  width: number,
  height: number,
  duration: number,
}>;

const handleFile = async (
  file: File,
  storage: IDataObjectStorage,
): Promise<void> => {
  const content = await getBase64(file);
  const {
    width,
    height,
    duration,
  } = await getVideoSize(content);
  const dataObject: IVideo = {
    uuid: uuidv4(),
    content,
    width,
    height,
    duration,
  };
  storage.upsert(dataObject);
};

export default {
  type: DataType.Video,
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.SpanClassification,
  ],
  label: 'video',
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
    // eslint-disable-next-line no-await-in-loop
    while (fs.length) await Promise.all(fs.splice(0, concurrency).map((f) => f()));
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
  display: BaseDisplay,
} as IDataTypeSetup<UploadTarget.Folder>;
