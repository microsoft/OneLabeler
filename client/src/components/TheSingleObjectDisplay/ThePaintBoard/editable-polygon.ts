import Konva from 'konva';
import { IEditableShape } from './types';

export interface IEditablePolygon extends IEditableShape {
  /** Get polygon contour points. */
  points(): [number, number][];
  /** Set polygon contour points. */
  points(value: [number, number][]): this;

  /** Get whether the polygon is editable. */
  editable(): boolean;
  /** Set whether the polygon is editable. */
  editable(value: boolean): this;

  /** Set the polygon to be in the editing state. */
  startEdit(): void;

  /** Set the polygon to be not in the editing state. */
  endEdit(): void;

  /** Get the group object. */
  getNode(): Konva.Group;

  /** Get the polygon object. */
  getPolygon(): Konva.Line;

  /** Get the anchor objects. */
  getAnchors(): Konva.Circle[];

  /** Set the callback when the polygon position is updated. */
  setOnUpdatePosition(value: (d: IEditablePolygon) => void): this;

  /** Set the callback when the polygon is clicked. */
  setOnClick(value: (d: IEditablePolygon) => void): this;
}

const toMatrix = <T>(arr: T[], width: number) => arr.reduce(
  (rows: T[][], entry: T, index: number) => {
    if (index % width === 0) {
      rows.push([entry]);
    } else {
      rows[rows.length - 1].push(entry);
    }
    return rows;
  }, [],
);

export default class EditablePolygon implements IEditablePolygon {
  /** The state of whether the polygon is editable. */
  #editable: boolean;

  /** The group containing the polygon and anchors. */
  #group: Konva.Group;

  /** The polygon. */
  #polygon: Konva.Line;

  /** The anchors of polygon control points. */
  #anchors: Konva.Circle[];

  /** The callback when the polygon position is updated. */
  #onUpdatePoints: ((d: EditablePolygon) => void) | null = null;

  /** The callback when the polygon is clicked. */
  #onClick: ((d: EditablePolygon) => void) | null = null;

  private showAnchors(): this {
    const anchors = this.#anchors;
    anchors.forEach((d) => {
      d.visible(true);
    });
    return this;
  }

  private hideAnchors(): this {
    const anchors = this.#anchors;
    anchors.forEach((d) => {
      d.visible(false);
    });
    return this;
  }

  private buildAnchor(x: number, y: number): Konva.Circle {
    const anchor = new Konva.Circle({
      x,
      y,
      radius: 0.25,
      stroke: '#666',
      fill: '#ddd',
      strokeWidth: 0.125,
      draggable: true,
    });
    anchor.on('mouseover', () => {
      anchor.strokeWidth(0.25);
    });
    anchor.on('mouseout', () => {
      anchor.strokeWidth(0.125);
    });
    anchor.on('dragmove', () => {
      const polygon = this.#polygon;
      const anchors = this.#anchors;
      const updatedPoints = anchors.map((d: Konva.Circle) => [d.x(), d.y()]);
      polygon.points(updatedPoints.flat());
    });
    anchor.on('dragend', () => {
      const polygon = this.#polygon;
      const anchors = this.#anchors;
      anchor.x(Math.floor(anchor.x()) + 0.5);
      anchor.y(Math.floor(anchor.y()) + 0.5);
      const updatedPoints = anchors.map((d: Konva.Circle) => [d.x(), d.y()]);
      polygon.points(updatedPoints.flat());
      if (this.#onUpdatePoints !== null) {
        this.#onUpdatePoints(this);
      }
    });
    return anchor;
  }

  startEdit(): void {
    const group = this.#group;
    const polygon = this.#polygon;
    const anchors = this.#anchors;

    polygon.fill('rgba(0,0,0,0.5)');
    group.draggable(true);
    this.showAnchors();
    group.on('dragend', () => {
      const dx = Math.round(group.x());
      const dy = Math.round(group.y());
      const updatedPoints = polygon.points()
        .map((d, i) => d + ((i % 2 === 0) ? dx : dy));
      polygon.points(updatedPoints);
      anchors.forEach((d) => {
        d.x(d.x() + dx);
        d.y(d.y() + dy);
      });
      group.x(0);
      group.y(0);

      if (this.#onUpdatePoints !== null) {
        this.#onUpdatePoints(this);
      }
    });
  }

  endEdit(): void {
    const polygon = this.#polygon;
    const group = this.#group;

    polygon.fill('');
    group.draggable(false);
    this.hideAnchors();
  }

  private enableEdit(): void {
    const group = this.#group;

    group.on('click', () => {
      this.startEdit();

      if (this.#onClick !== null) {
        this.#onClick(this);
      }
    });
  }

  private disableEdit(): void {
    const group = this.#group;

    this.endEdit();
    group.off('click');
    group.draggable(false);
  }

  points(): [number, number][];

  points(value: [number, number][]): this;

  points(value?: [number, number][]): [number, number][] | this {
    const polygon = this.#polygon;
    if (value === undefined) {
      return toMatrix(polygon.points(), 2) as [number, number][];
    }
    polygon.points(value.flat());
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

  getNode(): Konva.Group {
    return this.#group;
  }

  getPolygon(): Konva.Line {
    return this.#polygon;
  }

  getAnchors(): Konva.Circle[] {
    return this.#anchors;
  }

  setOnUpdatePosition(value: (d: EditablePolygon) => void): this {
    this.#onUpdatePoints = value;
    return this;
  }

  setOnClick(value: (d: EditablePolygon) => void): this {
    this.#onClick = value;
    return this;
  }

  constructor(
    points: [number, number][],
    editable = true,
  ) {
    const anchors = points.map((pt) => this.buildAnchor(pt[0], pt[1]));
    const polygon = new Konva.Line({
      points: points.flat(),
      stroke: 'black',
      strokeWidth: 0.25,
      opacity: 1,
      closed: true,
    });
    const group = new Konva.Group({
      draggable: false,
      polygon,
      anchors,
    });
    group.add(polygon);
    anchors.forEach((anchor) => {
      group.add(anchor);
    });

    this.#editable = editable;
    this.#group = group;
    this.#polygon = polygon;
    this.#anchors = anchors;

    this.hideAnchors();
    if (editable) {
      this.enableEdit();
    }
  }
}
