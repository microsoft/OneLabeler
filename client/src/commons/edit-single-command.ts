import { IDataObject, ILabelCategory, ICommand } from '@/commons/types';

export default class EditSingleCommand implements ICommand {
  // The data object to be edited.
  #dataObject: IDataObject;

  // The edited data object' label before edit batch.
  #oldLabel: ILabelCategory;

  // The edited data object' label after edit batch.
  #newLabel: ILabelCategory;

  // The function executing the single label editing.
  #editSingle: (dataObject: IDataObject, label: ILabelCategory) => void;

  constructor(
    dataObject: IDataObject,
    oldLabel: ILabelCategory,
    newLabel: ILabelCategory,
    editSingle: (dataObject: IDataObject, label: ILabelCategory) => void,
  ) {
    this.#dataObject = dataObject;
    this.#oldLabel = oldLabel;
    this.#newLabel = newLabel;
    this.#editSingle = editSingle;
  }

  execute(): void {
    this.#editSingle(this.#dataObject, this.#newLabel);
  }

  undo(): void {
    this.#editSingle(this.#dataObject, this.#oldLabel);
  }
}
