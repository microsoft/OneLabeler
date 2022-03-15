// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataObject, ILabelCategory, ICommand } from '@/commons/types';

export default class EditBatchCommand implements ICommand {
  // The data objects to be edited.
  #dataObjects: IDataObject[];

  // The edited data objects' labels before edit batch.
  #oldLabels: ILabelCategory[];

  // The edited data objects' labels after edit batch.
  #newLabels: ILabelCategory[];

  // The function executing the batch label editing.
  #editBatch: (dataObjects: IDataObject[], labels: ILabelCategory[]) => void;

  constructor(
    dataObjects: IDataObject[],
    oldLabels: ILabelCategory[],
    newLabels: ILabelCategory[],
    editBatch: (dataObjects: IDataObject[], labels: ILabelCategory[]) => void,
  ) {
    this.#dataObjects = dataObjects;
    this.#oldLabels = oldLabels;
    this.#newLabels = newLabels;
    this.#editBatch = editBatch;
  }

  execute(): void {
    this.#editBatch(this.#dataObjects, this.#newLabels);
  }

  undo(): void {
    this.#editBatch(this.#dataObjects, this.#oldLabels);
  }
}
