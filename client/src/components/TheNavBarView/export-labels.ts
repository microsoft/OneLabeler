import {
  DataType,
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ILabelStorage,
} from '@/commons/types';
import { saveJsonFile } from '@/plugins/file';
import dataTypeSetups from '@/builtins/data-types/index';

const EXPORT_FILE_NAME = 'labels.json';

const exportLabels = async (
  dataObjectStorage: IDataObjectStorage,
  labelStorage: ILabelStorage,
  dataType: DataType,
): Promise<void> => {
  const dataObjects = (await dataObjectStorage.getAll()) as IDataObject[];
  const labels = (await labelStorage.getAll()) as ILabel[];
  /*
  const uuid2idxInLabels: Record<string, number> = {};
  labels.forEach((d: ILabel, i) => {
    uuid2idxInLabels[d.uuid] = i;
  });
  */
  const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
  if (dataTypeSetup === undefined) return;
  const labeledData = dataTypeSetup.handleExport(dataObjects, labels);
  saveJsonFile(labeledData, EXPORT_FILE_NAME);
};

export default exportLabels;
