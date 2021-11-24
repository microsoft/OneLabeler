/**
 * Reference: https://github.com/joyceworks/flowchart-vue
 */

import { PortDirection } from './types';
import type {
  Box,
  Line,
  Point,
} from './types';

export const isPointInBox = (p: Point, box: Box): boolean => (
  p.x > box.xMin
  && p.x < box.xMax
  && p.y > box.yMin
  && p.y < box.yMax
);

export const getBBoxOfPoints = (points: Point[]): Box => ({
  xMin: Math.min(...points.map((d) => d.x), Infinity),
  yMin: Math.min(...points.map((d) => d.y), Infinity),
  xMax: Math.max(...points.map((d) => d.x), 0),
  yMax: Math.max(...points.map((d) => d.y), 0),
});

const getDirection = (line: Line) => {
  const isApproxEqual = (
    n: number,
    m: number,
  ): boolean => Math.abs(m - n) <= 3;
  const {
    x1,
    y1,
    x2,
    y2,
  } = line;
  if (x2 < x1 && isApproxEqual(y2, y1)) {
    return 'l';
  }
  if (x2 > x1 && isApproxEqual(y2, y1)) {
    return 'r';
  }
  if (isApproxEqual(x2, x1) && y2 < y1) {
    return 'u';
  }
  if (isApproxEqual(x2, x1) && y2 > y1) {
    return 'd';
  }
  if (x2 < x1 && y2 < y1) {
    return 'lu';
  }
  if (x2 > x1 && y2 < y1) {
    return 'ru';
  }
  if (x2 < x1 && y2 > y1) {
    return 'ld';
  }
  return 'rd';
};

/**
 * Compile a straight line that links two node ports
 * into orthogonal line segments.
 * @param line The directed straight line linking two node ports.
 * @param sourcePortDirection The direction of the port in the source node.
 * @param targetPortDirection The direction of the port in the target node.
 * @returns A list of points corresponding to orthogonal line segments.
 */
export const getZaggedPathPoints = (
  line: Line,
  sourcePortDirection: PortDirection = PortDirection.Right,
  targetPortDirection: PortDirection = PortDirection.Left,
): [number, number][] => {
  const {
    x1,
    y1,
    x2,
    y2,
  } = line;

  const points: [number, number][] = [];
  const start: [number, number] = [x1, y1];
  const end: [number, number] = [x2, y2];
  const centerX = start[0] + (end[0] - start[0]) / 2;
  const centerY = start[1] + (end[1] - start[1]) / 2;

  let second: [number, number] = [...start];
  let penult: [number, number] = [...end];
  if (sourcePortDirection === PortDirection.Left) {
    second = [start[0] - 20, start[1]];
  } else if (sourcePortDirection === PortDirection.Top) {
    second = [start[0], start[1] - 20];
  } else if (sourcePortDirection === PortDirection.Bottom) {
    second = [start[0], start[1] + 20];
  } else if (sourcePortDirection === PortDirection.Right) {
    second = [start[0] + 20, start[1]];
  }
  if (targetPortDirection === PortDirection.Left) {
    penult = [end[0] - 20, end[1]];
  } else if (targetPortDirection === PortDirection.Top) {
    penult = [end[0], end[1] - 20];
  } else if (targetPortDirection === PortDirection.Bottom) {
    penult = [end[0], end[1] + 20];
  } else if (targetPortDirection === PortDirection.Right) {
    penult = [end[0] + 20, end[1]];
  }
  const addVerticalCenterLine = () => {
    const third: [number, number] = [centerX, second[1]];
    const forth: [number, number] = [centerX, penult[1]];
    points.push(third);
    points.push(forth);
  };
  const addHorizontalCenterLine = () => {
    const third: [number, number] = [second[0], centerY];
    const forth: [number, number] = [penult[0], centerY];
    points.push(third);
    points.push(forth);
  };
  const addHorizontalTopLine = () => {
    points.push([second[0], start[1] - 50]);
    points.push([penult[0], start[1] - 50]);
  };
  const addHorizontalBottomLine = () => {
    points.push([second[0], start[1] + 50]);
    points.push([penult[0], start[1] + 50]);
  };
  const addVerticalRightLine = () => {
    points.push([start[0] + 80, second[1]]);
    points.push([start[0] + 80, penult[1]]);
  };
  const addVerticalLeftLine = () => {
    points.push([start[0] - 80, second[1]]);
    points.push([start[0] - 80, penult[1]]);
  };
  const addSecondXPenultY = () => {
    points.push([second[0], penult[1]]);
  };
  const addPenultXSecondY = () => {
    points.push([penult[0], second[1]]);
  };

  points.push(start);
  points.push(second);
  const direction = getDirection(line);
  if (direction.indexOf('r') > -1) {
    if (sourcePortDirection === PortDirection.Right || targetPortDirection === PortDirection.Left) {
      if (second[0] > centerX) {
        second[0] = centerX;
      }
      if (penult[0] < centerX) {
        penult[0] = centerX;
      }
    }
  }
  if (direction.indexOf('d') > -1) {
    if (sourcePortDirection === PortDirection.Bottom || targetPortDirection === PortDirection.Top) {
      if (second[1] > centerY) {
        second[1] = centerY;
      }
      if (penult[1] < centerY) {
        penult[1] = centerY;
      }
    }
  }
  if (direction.indexOf('l') > -1) {
    if (sourcePortDirection === PortDirection.Left || targetPortDirection === PortDirection.Right) {
      if (second[0] < centerX) {
        second[0] = centerX;
      }
      if (penult[0] > centerX) {
        penult[0] = centerX;
      }
    }
  }
  if (direction.indexOf('u') > -1) {
    if (sourcePortDirection === PortDirection.Top || targetPortDirection === PortDirection.Bottom) {
      if (second[1] < centerY) {
        second[1] = centerY;
      }
      if (penult[1] > centerY) {
        penult[1] = centerY;
      }
    }
  }
  switch (direction) {
    case 'lu': {
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Top:
          case PortDirection.Right:
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Top:
            addVerticalCenterLine();
            break;
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Top:
          case PortDirection.Right:
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else {
        // sourcePortDirection is left
        switch (targetPortDirection) {
          case PortDirection.Top:
          case PortDirection.Right:
            addVerticalCenterLine();
            break;
          default: {
            addPenultXSecondY();
            break;
          }
        }
      }
      break;
    }
    case 'u':
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Right: {
            break;
          }
          case PortDirection.Top: {
            addSecondXPenultY();
            break;
          }
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Right:
            addPenultXSecondY();
            break;
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addPenultXSecondY();
            break;
          }
          case PortDirection.Right: {
            addHorizontalCenterLine();
            break;
          }
          case PortDirection.Top:
            addVerticalRightLine();
            break;
          default: {
            break;
          }
        }
      } else {
        // left
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Right:
            break;
          default: {
            points.push([second[0], penult[1]]);
            break;
          }
        }
      }
      break;
    case 'ru':
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addVerticalCenterLine();
            break;
          }
          case PortDirection.Top: {
            addSecondXPenultY();
            break;
          }
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Top: {
            addVerticalCenterLine();
            break;
          }
          default: {
            addPenultXSecondY();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Right: {
            addVerticalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else {
        // left
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Top:
            addSecondXPenultY();
            break;
          default: {
            addHorizontalCenterLine();
            break;
          }
        }
      }
      break;
    case 'l':
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Right:
          case PortDirection.Top:
            addHorizontalTopLine();
            break;
          default: {
            addHorizontalBottomLine();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addHorizontalBottomLine();
            break;
          }
          case PortDirection.Right: {
            addSecondXPenultY();
            break;
          }
          case PortDirection.Top: {
            addVerticalCenterLine();
            break;
          }
          default: {
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addHorizontalTopLine();
            break;
          }
          case PortDirection.Right: {
            addSecondXPenultY();
            break;
          }
          case PortDirection.Top: {
            break;
          }
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        // left
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addHorizontalTopLine();
            break;
          }
          case PortDirection.Right: {
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      }
      break;
    case 'r':
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            break;
          }
          case PortDirection.Right: {
            addHorizontalTopLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addSecondXPenultY();
            break;
          }
          case PortDirection.Right: {
            addHorizontalBottomLine();
            break;
          }
          case PortDirection.Top: {
            addVerticalCenterLine();
            break;
          }
          default: {
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addPenultXSecondY();
            break;
          }
          case PortDirection.Right: {
            addHorizontalTopLine();
            break;
          }
          case PortDirection.Top: {
            break;
          }
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        // left
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Right:
          case PortDirection.Top:
            addHorizontalTopLine();
            break;
          default: {
            addHorizontalBottomLine();
            break;
          }
        }
      }
      break;
    case 'ld':
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addHorizontalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addPenultXSecondY();
            break;
          }
          case PortDirection.Top: {
            addHorizontalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Right:
          case PortDirection.Top:
            addPenultXSecondY();
            break;
          default: {
            addVerticalCenterLine();
            break;
          }
        }
      } else {
        // left
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Top:
            addPenultXSecondY();
            break;
          case PortDirection.Right: {
            addVerticalCenterLine();
            break;
          }
          default: {
            addSecondXPenultY();
            break;
          }
        }
      }
      break;
    case 'd':
      if (sourcePortDirection === PortDirection.Right) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addHorizontalCenterLine();
            break;
          }
          case PortDirection.Right: {
            addPenultXSecondY();
            break;
          }
          case PortDirection.Top: {
            addSecondXPenultY();
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Bottom) {
        switch (targetPortDirection) {
          case PortDirection.Left:
          case PortDirection.Right:
            addPenultXSecondY();
            break;
          case PortDirection.Top: {
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else if (sourcePortDirection === PortDirection.Top) {
        switch (targetPortDirection) {
          case PortDirection.Left: {
            addVerticalLeftLine();
            break;
          }
          default: {
            addVerticalRightLine();
            break;
          }
        }
      } else {
        // left
        switch (targetPortDirection) {
          case PortDirection.Left: {
            break;
          }
          case PortDirection.Right: {
            addHorizontalCenterLine();
            break;
          }
          case PortDirection.Top: {
            addSecondXPenultY();
            break;
          }
          default: {
            addVerticalLeftLine();
            break;
          }
        }
      }
      break;
    case 'rd': {
      if (sourcePortDirection === PortDirection.Right
        && targetPortDirection === PortDirection.Left) {
        addVerticalCenterLine();
      } else if (sourcePortDirection === PortDirection.Right
        && targetPortDirection === PortDirection.Bottom) {
        addSecondXPenultY();
      } else if (
        (sourcePortDirection === PortDirection.Right
          && targetPortDirection === PortDirection.Top)
        || (sourcePortDirection === PortDirection.Right
          && targetPortDirection === PortDirection.Right)
      ) {
        addPenultXSecondY();
      } else if (sourcePortDirection === PortDirection.Bottom
        && targetPortDirection === PortDirection.Left) {
        addSecondXPenultY();
      } else if (sourcePortDirection === PortDirection.Bottom
        && targetPortDirection === PortDirection.Right) {
        addPenultXSecondY();
      } else if (sourcePortDirection === PortDirection.Bottom
        && targetPortDirection === PortDirection.Top) {
        addHorizontalCenterLine();
      } else if (sourcePortDirection === PortDirection.Bottom
        && targetPortDirection === PortDirection.Bottom) {
        addSecondXPenultY();
      } else if (sourcePortDirection === PortDirection.Top
        && targetPortDirection === PortDirection.Left) {
        addPenultXSecondY();
      } else if (sourcePortDirection === PortDirection.Top
        && targetPortDirection === PortDirection.Right) {
        addPenultXSecondY();
      } else if (sourcePortDirection === PortDirection.Top
        && targetPortDirection === PortDirection.Top) {
        addPenultXSecondY();
      } else if (sourcePortDirection === PortDirection.Top
        && targetPortDirection === PortDirection.Bottom) {
        addVerticalCenterLine();
      } else if (sourcePortDirection === PortDirection.Left
        && targetPortDirection === PortDirection.Left) {
        addSecondXPenultY();
      } else if (sourcePortDirection === PortDirection.Left
        && targetPortDirection === PortDirection.Right) {
        addHorizontalCenterLine();
      } else if (sourcePortDirection === PortDirection.Left
        && targetPortDirection === PortDirection.Top) {
        addHorizontalCenterLine();
      } else if (sourcePortDirection === PortDirection.Left
        && targetPortDirection === PortDirection.Bottom) {
        addSecondXPenultY();
      }
      break;
    }
    default:
      break;
  }
  points.push(penult);
  points.push(end);
  return points;
};
