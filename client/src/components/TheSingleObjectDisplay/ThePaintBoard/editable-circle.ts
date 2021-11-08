import Konva from 'konva';
import { IEditableShape } from './types';

export interface IEditableCircle extends IEditableShape {
  /** Get circle center point. */
  point(): { x: number; y: number };
  /** Set circle center point. */
  point(value: { x: number; y: number }): this;

  /** Get whether the circle is editable. */
  editable(): boolean;
  /** Set whether the circle is editable. */
  editable(value: boolean): this;

  /** Set the circle to be in the editing state. */
  startEdit(): void;

  /** Set the circle to be not in the editing state. */
  endEdit(): void;

  /** Get the circle object. */
  getNode(): Konva.Circle;

  /** Set the callback when the circle position is updated. */
  setOnUpdatePosition(value: (d: IEditableCircle) => void): this;

  /** Set the callback when the circle is clicked. */
  setOnClick(value: (d: IEditableCircle) => void): this;
}

export default class EditableCircle implements IEditableCircle {
  /** The state of whether the circle is editable. */
  #editable: boolean;

  /** The circle. */
  #circle: Konva.Circle;

  /** The callback when the circle position is updated. */
  #onUpdatePoint: ((d: EditableCircle) => void) | null = null;

  /** The callback when the circle is clicked. */
  #onClick: ((d: EditableCircle) => void) | null = null;

  startEdit(): void {
    const circle = this.#circle;

    circle.fill('rgba(0,0,0,0.5)');
    circle.draggable(true);
    circle.on('dragend', () => {
      const x = Math.floor(circle.x()) + 0.5;
      const y = Math.floor(circle.y()) + 0.5;
      circle.x(x);
      circle.y(y);

      if (this.#onUpdatePoint !== null) {
        this.#onUpdatePoint(this);
      }
    });
  }

  endEdit(): void {
    const circle = this.#circle;

    circle.fill('');
    circle.draggable(false);
  }

  private enableEdit(): void {
    const circle = this.#circle;

    circle.on('click', () => {
      this.startEdit();
      if (this.#onClick !== null) {
        this.#onClick(this);
      }
    });
    circle.on('mouseover', () => {
      circle.strokeWidth(0.5);
    });
    circle.on('mouseout', () => {
      circle.strokeWidth(0.25);
    });
  }

  private disableEdit(): void {
    const circle = this.#circle;

    this.endEdit();
    circle.off('click');
    circle.off('mouseover');
    circle.off('mouseout');
    circle.draggable(false);
  }

  point(): { x: number; y: number };

  point(value: { x: number; y: number }): this;

  point(value?: { x: number; y: number }): { x: number; y: number } | this {
    const circle = this.#circle;
    if (value === undefined) {
      return { x: circle.x(), y: circle.y() };
    }
    const { x, y } = value;
    circle.x(x).y(y);
    return this;
  }

  editable(): boolean;

  editable(value: boolean): this;

  editable(value?: boolean): boolean | this {
    if (value === undefined) return this.#editable;

    if (value !== this.#editable) {
      if (value === true) {
        this.enableEdit();
      } else {
        this.disableEdit();
      }
    }

    this.#editable = value;
    return this;
  }

  getNode(): Konva.Circle {
    return this.#circle;
  }

  setOnUpdatePosition(value: (d: EditableCircle) => void): this {
    this.#onUpdatePoint = value;
    return this;
  }

  setOnClick(value: (d: EditableCircle) => void): this {
    this.#onClick = value;
    return this;
  }

  constructor(
    point: { x: number, y: number },
    editable = true,
  ) {
    const circle = new Konva.Circle({
      x: point.x,
      y: point.y,
      radius: 0.5,
      stroke: 'black',
      strokeWidth: 0.25,
      opacity: 1,
    });

    this.#editable = editable;
    this.#circle = circle;

    if (editable) {
      this.enableEdit();
    }
  }
}
