// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

// to suit your point format, run search/replace for '[0]' and '[1]';
// for 3D version, see 3d branch (configurability would draw significant performance overhead)

type Point = [number, number];

// square distance between 2 points
const getSqDist = (p1: Point, p2: Point): number => {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  return dx * dx + dy * dy;
};

// square distance from a point to a segment
const getSqSegDist = (p: Point, p1: Point, p2: Point): number => {
  let [x, y] = p1;
  let dx = p2[0] - x;
  let dy = p2[1] - y;
  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      [x, y] = p2;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }
  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
};
// rest of the code doesn't care about point format

// basic distance-based simplification
const simplifyRadialDist = (points: Point[], sqTolerance: number): Point[] => {
  if (points.length === 0) return [];

  let prevPoint = points[0];
  const newPoints = [prevPoint];
  let point: Point | null = null;

  points.forEach((d) => {
    point = d;
    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point);
      prevPoint = point;
    }
  });

  if (prevPoint !== point) newPoints.push(point as unknown as Point);

  return newPoints;
};

const simplifyDPStep = (
  points: Point[],
  first: number,
  last: number,
  sqTolerance: number,
  simplified: Point[],
): void => {
  let maxSqDist = sqTolerance;
  let index: number | null = null;

  for (let i = first + 1; i < last; i += 1) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (maxSqDist > sqTolerance) {
    if ((index as number) - first > 1) {
      simplifyDPStep(points, first, (index as number), sqTolerance, simplified);
    }
    simplified.push(points[(index as number)]);
    if (last - (index as number) > 1) {
      simplifyDPStep(points, (index as number), last, sqTolerance, simplified);
    }
  }
};

// simplification using Ramer-Douglas-Peucker algorithm
const simplifyDouglasPeucker = (points: Point[], sqTolerance: number): Point[] => {
  const last = points.length - 1;

  const simplified = [points[0]];
  simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
};

// both algorithms combined for awesome performance
export default (
  points: Point[],
  tolerance: number,
  highestQuality: boolean,
): Point[] => {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
  let simplified = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
  simplified = simplifyDouglasPeucker(points, sqTolerance);
  return simplified;
};
