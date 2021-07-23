interface Point {
  x: number;
  y: number;
}

// eslint-disable-next-line import/prefer-default-export
export const createDensePath = (start: Point, end: Point): Point[] => {
  // Given two integer positions,
  // interpolate a dense path from the start to the end.

  const path: Point[] = [];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return [{ ...start }];

  if (Math.abs(dx) >= Math.abs(dy)) {
    const k = dy / dx;
    if (dx >= 0) {
      for (let i = 0; i <= dx; i += 1) {
        path.push({
          x: start.x + i,
          y: Math.round(start.y + k * i),
        });
      }
    } else {
      for (let i = 0; i >= dx; i -= 1) {
        path.push({
          x: start.x + i,
          y: Math.round(start.y + k * i),
        });
      }
    }
  } else {
    const k = dx / dy;
    if (dy >= 0) {
      for (let i = 0; i <= dy; i += 1) {
        path.push({
          x: Math.round(start.x + k * i),
          y: start.y + i,
        });
      }
    } else {
      for (let i = 0; i >= dy; i -= 1) {
        path.push({
          x: Math.round(start.x + k * i),
          y: start.y + i,
        });
      }
    }
  }
  return path;
};
