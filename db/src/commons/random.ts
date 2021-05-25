/**
 * Randomly shuffle array.
 * Time complexity: O(array.length)
 * Space complexity: O(array.length)
 */
export const randomShuffle = <T>(
  array: T[],
  random: () => number = Math.random,
): T[] => {
  // Durstenfeld shuffle
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Randomly choose size samples from array without replacement.
 * Time complexity: O(array.length)
 * Space complexity: O(array.length)
 */
export const randomChoice = <T>(
  array: T[],
  size: number,
  random: () => number = Math.random,
): T[] => {
  // random sample with replacement
  const selection = [...Array(array.length).keys()];
  const shuffled = randomShuffle(selection, random);
  const indices = shuffled.slice(0, size);
  const samples = indices.map((d) => array[d]);
  return samples;
};

/**
 * Generate pseudo random numbers in [min, max] with
 * linear congruential generator.
 * Time complexity: O(size)
 * Space complexity: O(size)
 */
export const randomNumbersLCG = (
  min: number,
  max: number,
  size: number,
  seed: number,
): number[] => {
  const LARGE_PRIME = 10000004873;
  const b = 12345;
  const a = 1103515245;

  if (max < min) throw new Error('Invalid population: max < min');
  if (size < 0) throw new Error('Invalid sample: size < 0');
  if (max - min + 1 < size) throw new Error('Sample larger than population');
  if (max - min + 1 >= LARGE_PRIME) throw new Error('Population too large');

  const lcg = (
    s: number,
    multiplier: number,
    increment: number,
    m: number,
  ) => {
    let x = s;
    return function* gen() {
      x = (x * multiplier + increment) % m;
      yield x;
    };
  };

  const random = lcg(seed, a, b, LARGE_PRIME);
  const selection = Array(size).fill(null).map(() => (
    Math.round(((max - min) * (random().next().value as number)) / (LARGE_PRIME - 1)) + min
  ));
  return selection;
};
