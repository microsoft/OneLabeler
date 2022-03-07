import { v4 as uuidv4 } from 'uuid';
import { LabelTaskType, UploadTarget } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
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
  type: 'TextWithSpans',
  tasks: [
    LabelTaskType.Classification,
    LabelTaskType.MultiLabelClassification,
    LabelTaskType.FreeformText,
    LabelTaskType.SpanClassification,
    LabelTaskType.AnnotationRelation,
  ],
  label: 'text with spans',
  importType: UploadTarget.File,
  handleImport: async (
    file: File,
    storage: IDataObjectStorage,
    labels: ILabelStorage,
  ): Promise<void> => {
    (await parseJsonFile(file) as ITextWithSpan[]).forEach((d) => {
      const dataObject: IText = {
        uuid: d.uuid,
        content: d.content.sentence,
      };
      const label: ILabel = {
        uuid: d.uuid,
        spans: d.content.spans
          .filter((span) => !span.category.includes('time'))
          .map((span) => ({
            ...span,
            category: 'value',
            uuid: uuidv4(),
          })),
      };
      storage.upsert(dataObject);
      labels.upsert(label);
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
};
