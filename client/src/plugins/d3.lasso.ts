import * as d3 from 'd3';
import { Selection } from 'd3';

/**
 * Compile a polygon to a string specifying
 * the polygon boundary path for svg path element.
 */
const polygonToPath = (polygon: [number, number][]): string => (
  `M${polygon.map((d) => d.join(',')).join('L')}`
);

/** Compute the euclidean distance between two points.  */
const distance = (
  pt1: [number, number],
  pt2: [number, number],
): number => Math.sqrt(((pt2[0] - pt1[0]) ** 2) + ((pt2[1] - pt1[1]) ** 2));

/** Dispatched lasso event types. */
export enum LassoEventType {
  /** When the dragging for lasso selection starts. */
  Start = 'Start',
  /**
   * When the dragging for lasso selection ends
   * and the path form a valid selection.
   */
  End = 'End',
}

export interface ILasso {
  /** Render the lasso medium on the root element. */
  render<T extends SVGSVGElement | SVGGElement>(root: T): void;

  /**
   * Set the event listener for the specified type name
   * and return the lasso instance.
   * If an event listener was already registered for the same type and name,
   * the existing listener is removed before the new listener is added.
   */
  on(
    type: LassoEventType,
    callback: (lassoPolygon: [number, number][]) => void,
  ): this;

  /** Remove the lasso path. */
  removePath(): this;

  /** Remove the lasso medium from the root element. */
  unbind(): this;
}

type SelectionG = Selection<SVGGElement, unknown, Element | null, unknown>;
type SelectionRect = Selection<SVGRectElement, unknown, Element | null, unknown>;
type SelectionPath = Selection<SVGPathElement, unknown, Element | null, unknown>;
type SelectionLine = Selection<SVGLineElement, unknown, Element | null, unknown>;

export default class Lasso implements ILasso {
  /** The container of the medium. */
  #g: SelectionG | null = null;

  /** The medium on which the drag events are bind. */
  #medium: SelectionRect | null = null;

  /** The dragging path for lasso selection. */
  #lassoPath: SelectionPath | null = null;

  /**
   * The line closing the dragging path for lasso selection.
   * Created when the start and end points of the path are close enough.
   */
  #closeLine: SelectionLine | null = null;

  /** The dispatcher of lasso events. */
  #dispatch = d3.dispatch(LassoEventType.Start, LassoEventType.End);

  /**
   * The distance threshold.
   * If distance between the last point and
   * the first point is below the threshold,
   * the lasso path should close when mouse is released.
   */
  #closeDistance = 75;

  render<T extends SVGSVGElement | SVGGElement>(root: T): void {
    if (this.#g === null) {
      this.#g = d3.select<T, unknown>(root)
        .append<SVGGElement>('g');
    }
    if (this.#medium === null) {
      // create a transparent medium that covers the root element.
      const { width, height } = root.getBoundingClientRect();
      this.#medium = this.#g
        .append<SVGRectElement>('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('opacity', 0);
    }

    const g = this.#g;
    const medium = this.#medium;
    const dispatch = this.#dispatch;
    const closeDistance = this.#closeDistance;

    // The coordinates of the points passed by the lasso path.
    let lassoPolygon: [number, number][] = [];

    const started = (event: MouseEvent): void => {
      // Store the start point.
      lassoPolygon = [[event.x, event.y]];

      if (this.#lassoPath) {
        this.#lassoPath.remove();
      }

      this.#lassoPath = g.append('path')
        .attr('fill', '#bbb')
        .attr('fill-opacity', 0.1)
        .attr('stroke', '#bbb')
        .attr('stroke-width', '2')
        .attr('stroke-dasharray', '2, 2');

      this.#closeLine = g.append('line')
        .attr('x2', lassoPolygon[0][0])
        .attr('y2', lassoPolygon[0][1])
        .attr('stroke', '#000')
        .attr('stroke-width', '2')
        .attr('stroke-dasharray', '2, 2')
        .attr('opacity', 0);

      dispatch.call(LassoEventType.Start, this, lassoPolygon);
    };

    const dragged = (event: MouseEvent): void => {
      const point = [event.x, event.y] as [number, number];
      lassoPolygon.push(point);
      (this.#lassoPath as SelectionPath)
        .attr('d', polygonToPath(lassoPolygon));

      // Check if start and end points are within closing distance.
      const dist = distance(
        lassoPolygon[0],
        lassoPolygon[lassoPolygon.length - 1],
      );
      if (dist < closeDistance) {
        (this.#closeLine as SelectionLine)
          .attr('x1', point[0])
          .attr('y1', point[1])
          .attr('opacity', 1);
      } else {
        (this.#closeLine as SelectionLine)
          .attr('opacity', 0);
      }
    };

    const ended = (): void => {
      // Remove the close line.
      (this.#closeLine as SelectionLine)
        .remove();
      this.#closeLine = null;

      const dist = distance(
        lassoPolygon[0],
        lassoPolygon[lassoPolygon.length - 1],
      );
      if (dist < closeDistance) {
        // If successfully closed:
        (this.#lassoPath as SelectionPath)
          .attr('d', `${polygonToPath(lassoPolygon)}Z`);
        dispatch.call(LassoEventType.End, this, lassoPolygon);
      } else {
        // Otherwise cancel:
        (this.#lassoPath as SelectionPath)
          .remove();
        this.#lassoPath = null;
        lassoPolygon = [];
      }
    };

    const drag = d3
      .drag()
      .on('start', started)
      .on('drag', dragged)
      .on('end', ended);
    (medium as unknown as Selection<Element, unknown, SVGElement | null, unknown>).call(drag);
  }

  on(
    type: LassoEventType,
    callback: (lassoPolygon: [number, number][]) => void,
  ): this {
    this.#dispatch.on(type, callback);
    return this;
  }

  removePath(): this {
    if (this.#lassoPath) {
      this.#lassoPath.remove();
      this.#lassoPath = null;
    }
    if (this.#closeLine) {
      this.#closeLine.remove();
      this.#closeLine = null;
    }
    return this;
  }

  unbind(): this {
    if (this.#g) {
      this.#g.remove();
      this.#g = null;
    }
    return this;
  }
}
