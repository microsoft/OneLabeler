import { IDataObject, Label, ICommand } from '@/types';

export default class EditBatchCommand implements ICommand {
  // The data objects to be edited.
  #dataObjects: IDataObject[];

  // The edited data objects' labels before edit batch.
  #oldLabels: Label[];

  // The edited data objects' labels after edit batch.
  #newLabels: Label[];

  // The function executing the batch label editing.
  #editBatch: (dataObjects: IDataObject[], labels: Label[]) => void;

  constructor(
    dataObjects: IDataObject[],
    oldLabels: Label[],
    newLabels: Label[],
    editBatch: (dataObjects: IDataObject[], labels: Label[]) => void,
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
