import { v4 as uuidv4 } from 'uuid';
import {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
  ILabelTextSpan,
  IText,
  LabelTaskType,
  UploadTarget,
} from '@/commons/types';
import { parseJsonFile } from '@/plugins/file';
import VDisplay from './VDisplay.vue';

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
  label: 'text',
  importType: UploadTarget.File,
  handleImport: async (
    input: File,
    storage: IDataObjectStorage,
    labels: ILabelStorage,
  ) => {
    const file = input as File;
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
};
