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
import VDisplay from './VDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

const getVideoSize = (content: string) => new Promise((resolve) => {
  const video = document.createElement('video');
  video.addEventListener('loadedmetadata', function () {
    resolve({
      height: this.videoHeight,
      width: this.videoWidth,
      duration: this.duration,
    });
  }, false);
  video.src = content;
}) as Promise<{
  width: number,
  height: number,
  duration: number,
}>;

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
    await Promise.all([...files].map(async (file) => {
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
        url: d.url,
        content: d.content,
      };
      const idx = uuid2idxInLabels[d.uuid];
      return idx === undefined ? partial : { ...labels[idx], ...partial };
    });
  },
  display: VDisplay,
} as IDataTypeSetup<UploadTarget.Folder>;
