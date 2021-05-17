import {
  ICommand,
  IDataObject,
  ILabelCategory,
  Status,
} from '@/commons/types';

export class FeatureExtractionCommand implements ICommand {
  // The edited data object' label before execution.
  #oldDataObjects: IDataObject[];

  // The edited data object' label after execution.
  #newDataObjects: IDataObject[];

  // The status data object' label before execution.
  #oldFeatureNames: string[];

  // The status data object' label after execution.
  #newFeatureNames: string[];

  outputs = ['featureValues'];

  constructor(
    oldDataObjects: IDataObject[],
    newDataObjects: IDataObject[],
    oldFeatureNames: string[],
    newFeatureNames: string[],
  ) {
    this.#oldDataObjects = oldDataObjects;
    this.#newDataObjects = newDataObjects;
    this.#oldFeatureNames = oldFeatureNames;
    this.#newFeatureNames = newFeatureNames;
  }

  execute(): void {
    /*
    const dataObjects = this.#newDataObjects;
    const featureNames = this.#newFeatureNames;
    commit(types.SET_DATA_OBJECTS, dataObjects);
    commit(types.SET_FEATURE_NAMES, featureNames);
    */
  }

  undo(): void {
    /*
    const dataObjects = this.#oldDataObjects;
    const featureNames = this.#oldFeatureNames;
    commit(types.SET_DATA_OBJECTS, dataObjects);
    commit(types.SET_FEATURE_NAMES, featureNames);
    */
  }
}

export class DataObjectSelectionCommand implements ICommand {
  // The uuids of data objects queried.
  #uuids: string[];

  // The edited data object' label before execution.
  #oldQueryIndices: number[];

  // The edited data object' label after execution.
  #newQueryIndices: number[];

  // The status data object' label before execution.
  #oldStatuses: Status[];

  // The status data object' label after execution.
  #newStatuses: Status[];

  outputs = ['queryIndices'];

  constructor(
    uuids: string[],
    oldQueryIndices: number[],
    newQueryIndices: number[],
    oldStatuses: Status[],
    newStatuses: Status[],
  ) {
    this.#uuids = uuids;
    this.#oldQueryIndices = oldQueryIndices;
    this.#newQueryIndices = newQueryIndices;
    this.#oldStatuses = oldStatuses;
    this.#newStatuses = newStatuses;
  }

  execute(): void {
    /*
    const uuids = this.#uuids;
    const queryIndices = this.#newQueryIndices;
    const statuses = this.#newStatuses;
    commit(types.SET_QUERY_INDICES, queryIndices);
    commit(types.SET_STATUSES_OF, { uuids, statuses });
    */
  }

  undo(): void {
    /*
    const uuids = this.#uuids;
    const queryIndices = this.#oldQueryIndices;
    const statuses = this.#oldStatuses;
    commit(types.SET_QUERY_INDICES, queryIndices);
    commit(types.SET_STATUSES_OF, { uuids, statuses });
    */
  }
}

export class DefaultLabelingCommand implements ICommand {
  // The uuids of data objects labeled.
  #uuids: string[];

  // The edited data object' label before execution.
  #oldLabels: ILabelCategory[];

  // The edited data object' label after execution.
  #newLabels: ILabelCategory[];

  outputs = ['labels'];

  constructor(
    uuids: string[],
    oldLabels: ILabelCategory[],
    newLabels: ILabelCategory[],
  ) {
    this.#uuids = uuids;
    this.#oldLabels = oldLabels;
    this.#newLabels = newLabels;
  }

  execute(): void {
    /*
    const uuids = this.#uuids;
    const labels = this.#newLabels;
    commit(types.SET_LABELS_OF, { uuids, labels });
    */
  }

  undo(): void {
    /*
    const uuids = this.#uuids;
    const labels = this.#oldLabels;
    commit(types.SET_LABELS_OF, { uuids, labels });
    */
  }
}

export interface IInteractiveLabelingCommand extends ICommand { }

export class EditSingleCommand implements IInteractiveLabelingCommand {
  // The uuid of data object to be edited.
  #uuid: string;

  // The edited data object' label before execution.
  #oldLabel: ILabelCategory;

  // The edited data object' label after execution.
  #newLabel: ILabelCategory;

  // The status data object' label before execution.
  #oldStatus: Status;

  // The status data object' label after execution.
  #newStatus: Status;

  outputs = ['labels', 'statuses'];

  constructor(
    uuid: string,
    oldLabel: ILabelCategory,
    newLabel: ILabelCategory,
    oldStatus: Status,
    newStatus: Status,
  ) {
    this.#uuid = uuid;
    this.#oldLabel = oldLabel;
    this.#newLabel = newLabel;
    this.#oldStatus = oldStatus;
    this.#newStatus = newStatus;
  }

  execute(): void {
    /*
    const uuid = this.#uuid;
    const label = this.#newLabel;
    const status = this.#newStatus;
    commit(types.SET_LABEL_OF, { uuid, label });
    commit(types.SET_STATUS_OF, { uuid, status });
    */
  }

  undo(): void {
    /*
    const uuid = this.#uuid;
    const label = this.#oldLabel;
    const status = this.#oldStatus;
    commit(types.SET_LABEL_OF, { uuid, label });
    commit(types.SET_STATUS_OF, { uuid, status });
    */
  }
}

export class EditBatchCommand implements IInteractiveLabelingCommand {
  // The uuids of data objects to be edited.
  #uuids: string[];

  // The edited data object' label before execution.
  #oldLabels: ILabelCategory[];

  // The edited data object' label after execution.
  #newLabels: ILabelCategory[];

  // The status data object' label before execution.
  #oldStatuses: Status[];

  // The status data object' label after execution.
  #newStatuses: Status[];

  outputs = ['labels', 'statuses'];

  constructor(
    uuids: string[],
    oldLabels: ILabelCategory[],
    newLabels: ILabelCategory[],
    oldStatuses: Status[],
    newStatuses: Status[],
  ) {
    this.#uuids = uuids;
    this.#oldLabels = oldLabels;
    this.#newLabels = newLabels;
    this.#oldStatuses = oldStatuses;
    this.#newStatuses = newStatuses;
  }

  execute(): void {
    /*
    const uuids = this.#uuids;
    const labels = this.#newLabels;
    const statuses = this.#newStatuses;
    commit(types.SET_LABELS_OF, { uuids, labels });
    commit(types.SET_STATUSES_OF, { uuids, statuses });
    */
  }

  undo(): void {
    /*
    const uuids = this.#uuids;
    const labels = this.#oldLabels;
    const statuses = this.#oldStatuses;
    commit(types.SET_LABELS_OF, { uuids, labels });
    commit(types.SET_STATUSES_OF, { uuids, statuses });
    */
  }
}

export class StoppageAnalysisCommand implements ICommand {
  // The stop before execution.
  #oldStop: boolean;

  // The stop after execution.
  #newStop: boolean;

  outputs = ['stop'];

  constructor(
    oldStop: boolean,
    newStop: boolean,
  ) {
    this.#oldStop = oldStop;
    this.#newStop = newStop;
  }

  execute(): void {
    /*
    const stop = this.#newStop;
    commit(types.SET_STOP, stop);
    */
  }

  undo(): void {
    /*
    const stop = this.#oldStop;
    commit(types.SET_STOP, stop);
    */
  }
}
