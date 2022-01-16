import {
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  IDataTypeSetup,
  ILabel,
  ILabelTextSpan,
  IText,
} from '@/commons/types';
import { parseJsonFile } from '@/plugins/file';
import BaseDisplay from './BaseDisplay.vue';

type IExport<T extends IDataObject> = (
  Partial<ILabel> & { content: T['content'] }
)[];

interface ITextWithSpan extends IDataObject {
  uuid: string;
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    spans: ILabelTextSpan[];
    /** The sentence accompanying the table. */
    sentence: string;
  };
}

export default {
  type: 'TextWithUuid',
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.SpanClassification,
    LabelTaskType.AnnotationRelation,
  ],
  label: 'text with uuid',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
  ): Promise<void> => {
    (await parseJsonFile(file) as ITextWithSpan[]).forEach((d) => {
      const dataObject: IText = {
        uuid: d.uuid,
        content: d.content.sentence,
      };
      storage.upsert(dataObject);
    });
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
