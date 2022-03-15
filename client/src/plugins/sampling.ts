// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const getType = (arr: Array<unknown> | Uint8Array) => {
  if (arr instanceof Array) return Array;
  if (arr instanceof Uint8Array) return Uint8Array;
  throw new Error('Invalid array type');
};

const linearInterpolate = (x1: number, x2: number, t: number) => x1 + (x2 - x1) * t;

/** Upsample the array to new length by padding with linear interpolation. */
export const upsample = <T extends (number[] | Uint8Array)>(
  arr: T,
  newLength: number,
): T => {
  if (arr.length > newLength) throw new Error('Invalid new length: arr.length > new length');
  const type = getType(arr);

  // Moving 1 index forward in new array is same as moving stepSize forward in the original array
  const stepSize = (arr.length - 1) / (newLength - 1);

  const newArr = new type(newLength).fill(0).map((d, i) => {
    // Start the new array with the first element.
    if (i === 0) return arr[0];
    // End the new array with the last element.
    if (i === newLength - 1) return arr[arr.length - 1];
    // Interpolate with the values before and after the current location.
    const location = i * stepSize;
    const before = Math.floor(location);
    const after = Math.ceil(location);
    const t = location - before;
    return linearInterpolate(arr[before], arr[after], t);
  });

  return newArr as T;
};

/** Get the length of the overlap of two intervals. */
const getOverlapLength = (
  [s1, e1]: [number, number],
  [s2, e2]: [number, number],
): number => {
  if (e1 <= s2 || e2 <= s1) return 0;
  // The start of the overlapping interval.
  const s = Math.max(Math.min(e1, s2), Math.min(e2, s1));
  // The end of the overlapping interval.
  const e = Math.min(Math.max(e1, s2), Math.max(e2, s1));
  return e - s;
};

/** Downsample the array to new length. */
export const downsample = <T extends (number[] | Uint8Array)>(
  arr: T,
  newLength: number,
): T => {
  if (arr.length < newLength) throw new Error('Invalid new length: arr.length < new length');
  const type = getType(arr);

  const oldStep = 1 / arr.length;
  const newStep = 1 / newLength;

  const newArr = new type(newLength).fill(0).map((d, i) => {
    const newStart = i * newStep;
    const newEnd = (i + 1) * newStep;

    // The j value below which makes oldEnd < newStart
    const jMin = Math.floor(newStart / oldStep) - 1;
    // const jMin = 0;

    // The j value above which makes oldStart > newEnd
    const jMax = Math.ceil(newEnd / oldStep) + 1;
    // const jMax = arr.length;

    // Note: if replacing jMin with 0 and jMax with oldLength
    // the function will still work, but at a lower speed.
    let sum = 0;
    for (let j = jMin; j < jMax; j += 1) {
      const oldStart = j * oldStep;
      const oldEnd = (j + 1) * oldStep;
      const overlap = getOverlapLength([oldStart, oldEnd], [newStart, newEnd]);
      if (overlap > 0) sum += (overlap / newStep) * arr[j];
    }
    return sum;
  });
  return newArr as T;
};

/** Upsample/Downsample the array to new length. */
export const resample = <T extends (number[] | Uint8Array)>(
  arr: T,
  newLength: number,
): T => {
  const type = getType(arr);
  if (arr.length === newLength) return new type(...arr) as T;
  if (arr.length < newLength) return upsample(arr, newLength);
  return downsample(arr, newLength);
};

/** Upsample the 2d array to new height (i.e., length) by padding with linear interpolation. */
const upsampleHeight = <T extends (number[] | Uint8Array)>(
  matrix: T[],
  newHeight: number,
): T[] => {
  if (matrix.length > newHeight) throw new Error('Invalid new length: matrix.length > new length');
  if (matrix.length === 0) return matrix;
  const type = getType(matrix[0]);
  const width = matrix[0].length;

  // Moving 1 index forward in new array is same as moving stepSize forward in the original array
  const stepSize = (matrix.length - 1) / (newHeight - 1);

  const newMatrix = new Array(newHeight).fill(null).map((d, i) => {
    // Start the new array with the first element.
    if (i === 0) return [...matrix[0]];
    // End the new array with the last element.
    if (i === newHeight - 1) return [...matrix[matrix.length - 1]];
    // Interpolate with the values before and after the current location.
    const location = i * stepSize;
    const before = Math.floor(location);
    const after = Math.ceil(location);
    const t = location - before;
    const row = new type(width).fill(0);
    return row.map((d, i) => linearInterpolate(matrix[before][i], matrix[after][i], t));
  });

  return newMatrix as T[];
};

/** Downsample the 2d array to new height (with width unchanged). */
const downsampleHeight = <T extends (number[] | Uint8Array)>(
  matrix: T[],
  newHeight: number,
): T[] => {
  if (matrix.length < newHeight) throw new Error('Invalid new length: matrix.length < new length');
  if (matrix.length === 0) return matrix;
  const type = getType(matrix[0]);
  const width = matrix[0].length;

  const oldStep = 1 / matrix.length;
  const newStep = 1 / newHeight;

  const newMatrix = new Array(newHeight).fill(null).map((d, i) => {
    const newStart = i * newStep;
    const newEnd = newStart + newStep;

    // The j value below which makes oldEnd < newStart
    const jMin = Math.max(0, Math.floor(newStart / oldStep) - 1);
    // const jMin = 0;

    // The j value above which makes oldStart > newEnd
    const jMax = Math.min(matrix.length, Math.ceil(newEnd / oldStep) + 1);
    // const jMax = matrix.length;

    // Note: if replacing jMin with 0 and jMax with oldLength
    // the function will still work, but at a lower speed.
    const row = new type(width).fill(0);
    for (let j = jMin; j < jMax; j += 1) {
      const oldStart = j * oldStep;
      const oldEnd = oldStart + oldStep;
      const overlap = getOverlapLength([oldStart, oldEnd], [newStart, newEnd]);
      if (overlap > 0) {
        for (let k = 0; k < width; k += 1) {
          row[k] += (overlap / newStep) * matrix[j][k];
        }
      }
    }
    return row;
  });

  return newMatrix as T[];
};

/** Upsample/Downsample the 2d array to new height (with width unchanged). */
export const resampleHeight = <T extends (number[] | Uint8Array)>(
  matrix: T[],
  newHeight: number,
): T[] => {
  if (matrix.length === 0) return matrix;
  const type = getType(matrix[0]);
  if (matrix.length === newHeight) return matrix.map((row) => new type(...row) as T);
  if (matrix.length < newHeight) return upsampleHeight(matrix, newHeight);
  return downsampleHeight(matrix, newHeight);
};

/** Upsample/Downsample the 2d array to new height and width. */
export const resample2d = <T extends (number[] | Uint8Array)>(
  matrix: T[],
  newHeight: number,
  newWidth: number,
): T[] => {
  if (matrix.length === 0) return matrix;
  const height = matrix.length;
  const width = matrix[0].length;
  if (height === undefined || width === undefined) {
    throw new Error(`Invalid matrix size: ${width} * ${height}`);
  }

  if (height >= width) {
    const heightResampled = resampleHeight(matrix, newHeight);
    return heightResampled.map((row) => resample(row, newWidth));
  }
  const widthResampled = matrix.map((row) => resample(row, newWidth));
  return resampleHeight(widthResampled, newHeight);
};

/*
export const downsamplefast = (arr: number[], newLength: number): number[] => {
  if (arr.length < newLength) throw new Error('Invalid new length: arr.length < new length');

  // Moving 1 index forward in new array is same as moving stepSize forward in the original array
  const stepSize = arr.length / newLength;

  const newArr = new Array(newLength).fill(null).map((d, i) => {
    const start = Math.round(i * stepSize);
    const end = Math.round((i + 1) * stepSize);
    const sum = arr.slice(start, end).reduce((a, b) => a + b, 0);
    return sum / (end - start);
  });
  return newArr;
};
*/
