import { IDataObject, Label, ICommand } from '@/commons/types';

export default class EditSingleCommand implements ICommand {
  // The data object to be edited.
  #dataObject: IDataObject;

  // The edited data object' label before edit batch.
  #oldLabel: Label;

  // The edited data object' label after edit batch.
  #newLabel: Label;

  // The function executing the single label editing.
  #editSingle: (dataObject: IDataObject, label: Label) => void;

  constructor(
    dataObject: IDataObject,
    oldLabel: Label,
    newLabel: Label,
    editSingle: (dataObject: IDataObject, label: Label) => void,
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
