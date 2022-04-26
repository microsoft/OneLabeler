import axios from 'axios';
import { Category, ModuleType } from '@/commons/types';
import type {
  IDataObject,
  IDataObjectStorage,
  ILabel,
  ModelService,
} from '@/commons/types';
import BaseModule from '@/builtins/modules/base-module';
import bindErrorHandler from './handle-error';

/**
 * Workflow Component - Default Labeling
 * Assign default labels to a batch of data objects (for the user to verify).
 * @param dataObjects The data objects to be assigned default labels.
 * @param model The default labeling model.
 * @returns defaultLabels - the default labels of the selected data objects.
 */
const serverExecute = async (
  api: string,
  dataObjects: IDataObjectStorage,
  queryUuids: string[],
  categories: Category[],
  unlabeledMark: Category,
  model?: ModelService,
): Promise<Partial<ILabel>[]> => {
  const queriedDataObjects = (await (dataObjects as IDataObjectStorage)
    .getBulk(queryUuids)) as IDataObject[];

  const response = await bindErrorHandler(axios.post(
    api,
    JSON.stringify({
      dataObjects: queriedDataObjects,
      model,
      classes: categories,
      unlabeledMark,
    }),
  ));
  const { labels } = response.data as { labels: Partial<ILabel>[] };
  return labels;
};

export default class BaseDefaultLabelingServerModule extends BaseModule {
  readonly type = ModuleType.DefaultLabeling;

  readonly isServerless = false;

  api = '';

  readonly run = async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
      categories: Category[],
      unlabeledMark: Category,
      model?: ModelService,
    },
  ): Promise<{ labels: Partial<ILabel>[] }> => {
    const { api } = this;
    const defaultLabels: Partial<ILabel>[] = await serverExecute(
      api,
      inputs.dataObjects,
      inputs.queryUuids,
      inputs.categories,
      inputs.unlabeledMark,
      inputs.model,
    );
    return { labels: defaultLabels };
  }
}
