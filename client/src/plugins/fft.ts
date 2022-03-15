// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable no-bitwise */
/**
 * Calculate FFT.
 *
 * Reference: https://github.com/katspaugh/wavesurfer.js/blob/master/src/plugin/spectrogram/fft.js
 */

enum WindowFunction {
  bartlett = 'bartlett',
  bartlettHann = 'bartlettHann',
  blackman = 'blackman',
  cosine = 'cosine',
  gauss = 'gauss',
  hamming = 'hamming',
  hann = 'hann',
  lanczoz = 'lanczoz',
  rectangular = 'rectangular',
  triangular = 'triangular',
}

const computeWindowValues = (
  windowFunc: string,
  bufferSize: number,
  alpha: number | null = null,
): Float32Array => {
  let windowValues = new Float32Array(bufferSize).fill(0);

  const bartlett = (len: number, i: number) => (2 / (len - 1))
    * ((len - 1) / 2 - Math.abs(i - (len - 1) / 2));
  const bartlettHann = (len: number, i: number) => (
    0.62
    - 0.48 * Math.abs(i / (len - 1) - 0.5)
    - 0.38 * Math.cos((Math.PI * 2 * i) / (len - 1))
  );
  const blackman = (len: number, i: number, alpha: number) => (
    (1 - alpha) / 2
    - 0.5 * Math.cos((Math.PI * 2 * i) / (len - 1))
    + (alpha / 2) * Math.cos((4 * Math.PI * i) / (len - 1))
  );
  const cosine = (len: number, i: number) => (
    Math.cos((Math.PI * i) / (len - 1) - Math.PI / 2)
  );
  const gauss = (len: number, i: number, alpha: number) => (
    Math.E ** (-0.5 * (((i - (len - 1) / 2) / ((alpha * (len - 1)) / 2)) ** 2))
  );
  const hamming = (len: number, i: number) => (
    0.54 - 0.46 * Math.cos((Math.PI * 2 * i) / (len - 1))
  );
  const hann = (len: number, i: number) => (
    0.5 * (1 - Math.cos((Math.PI * 2 * i) / (len - 1)))
  );
  const lanczoz = (len: number, i: number) => (
    Math.sin(Math.PI * ((2 * i) / (len - 1) - 1)) /
    (Math.PI * ((2 * i) / (len - 1) - 1))
  );
  const rectangular = () => 1;
  const triangular = (len: number, i: number) => (
    (2 / len) * (len / 2 - Math.abs(i - (len - 1) / 2))
  );

  if (windowFunc === WindowFunction.bartlett) {
    windowValues = windowValues.map((d, i) => bartlett(bufferSize, i));
  } else if (windowFunc === WindowFunction.bartlettHann) {
    windowValues = windowValues.map((d, i) => bartlettHann(bufferSize, i));
  } else if (windowFunc === WindowFunction.blackman) {
    const a = alpha ?? 0.16;
    windowValues = windowValues.map((d, i) => blackman(bufferSize, i, a));
  } else if (windowFunc === WindowFunction.cosine) {
    windowValues = windowValues.map((d, i) => cosine(bufferSize, i));
  } else if (windowFunc === WindowFunction.gauss) {
    const a = alpha ?? 0.25;
    windowValues = windowValues.map((d, i) => gauss(bufferSize, i, a));
  } else if (windowFunc === WindowFunction.hamming) {
    windowValues = windowValues.map((d, i) => hamming(bufferSize, i));
  } else if (windowFunc === WindowFunction.hann) {
    windowValues = windowValues.map((d, i) => hann(bufferSize, i));
  } else if (windowFunc === WindowFunction.lanczoz) {
    windowValues = windowValues.map((d, i) => lanczoz(bufferSize, i));
  } else if (windowFunc === WindowFunction.rectangular) {
    windowValues = windowValues.map((d, i) => rectangular());
  } else if (windowFunc === WindowFunction.triangular) {
    windowValues = windowValues.map((d, i) => triangular(bufferSize, i));
  } else {
    throw Error(`No such window function <${windowFunc}>`);
  }
  return windowValues;
};

const computeReverseTable = (bufferSize: number): Uint32Array => {
  const reverseTable = new Uint32Array(bufferSize);
  let limit = 1;
  let bit = bufferSize >> 1;
  while (limit < bufferSize) {
    for (let i = 0; i < limit; i += 1) {
      reverseTable[i + limit] = reverseTable[i] + bit;
    }
    limit <<= 1;
    bit >>= 1;
  }
  return reverseTable;
};

const FFT = (
  buffer: number[],
  windowFunc: WindowFunction = WindowFunction.hann,
  alpha: number | null = null,
): Float32Array => {
  const bufferSize = buffer.length;

  const k = Math.floor(Math.log(bufferSize) / Math.LN2);
  if (2 ** k !== bufferSize) {
    throw Error('Invalid buffer size, must be a power of 2.');
  }

  const sinTable = new Float32Array(bufferSize).fill(0)
    .map((d, i) => Math.sin(-Math.PI / i));
  const cosTable = new Float32Array(bufferSize).fill(0)
    .map((d, i) => Math.cos(-Math.PI / i));
  const windowValues = computeWindowValues(windowFunc, bufferSize, alpha);
  const reverseTable = computeReverseTable(bufferSize);
  const real = new Float32Array(bufferSize).fill(0).map((d, i) => (
    buffer[reverseTable[i]] * windowValues[reverseTable[i]]
  ));
  const imag = new Float32Array(bufferSize).fill(0);

  let halfSize = 1;
  while (halfSize < bufferSize) {
    const phaseShiftStepReal = cosTable[halfSize];
    const phaseShiftStepImag = sinTable[halfSize];
    let currentPhaseShiftReal = 1;
    let currentPhaseShiftImag = 0;
    for (let fftStep = 0; fftStep < halfSize; fftStep += 1) {
      let i = fftStep;
      while (i < bufferSize) {
        const off = i + halfSize;
        const tr = currentPhaseShiftReal * real[off]
          - currentPhaseShiftImag * imag[off];
        const ti = currentPhaseShiftReal * imag[off]
          + currentPhaseShiftImag * real[off];
        real[off] = real[i] - tr;
        imag[off] = imag[i] - ti;
        real[i] += tr;
        imag[i] += ti;
        i += halfSize << 1;
      }
      const tmpReal = currentPhaseShiftReal;
      currentPhaseShiftReal = tmpReal * phaseShiftStepReal
        - currentPhaseShiftImag * phaseShiftStepImag;
      currentPhaseShiftImag = tmpReal * phaseShiftStepImag
        + currentPhaseShiftImag * phaseShiftStepReal;
    }
    halfSize <<= 1;
  }

  const spectrum = new Float32Array(bufferSize / 2).fill(0).map((d, i) => (
    (2 / bufferSize) * Math.sqrt(real[i] * real[i] + imag[i] * imag[i])
  ));
  return spectrum;
};

export default FFT;
