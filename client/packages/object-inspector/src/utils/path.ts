import { getPropertyValue } from './data';
import type { ObjectIterator } from './data';

export const DEFAULT_ROOT_PATH = '$';

const WILDCARD = '*';

/** Checks whether the data has child nodes. */
export const hasChildNodes = (
  data: unknown,
  dataIterator: ObjectIterator,
) => (
  !dataIterator(data).next().done
);

/**
 * Create a list of wildcard paths
 * used to match all attributes to the given level.
 */
export const wildcardPathsFromLevel = (level: number): string[] => (
  // i is depth
  Array.from({ length: level }, (_, i) => (
    [DEFAULT_ROOT_PATH]
      .concat(Array.from({ length: i }, () => '*'))
      .join('.')
  ))
);

/**
 * Get the paths that should be expanded.
 * In the returned object, if a path should be expanded,
 * it will be stored as key with value storing true.
 */
export const getExpandedPaths = (
  data: unknown,
  dataIterator: ObjectIterator,
  expandPaths: string[],
  expandLevel: number,
  prevExpandedPaths: { [key: string]: boolean },
): { [key: string]: boolean } => {
  const wildcardPaths: string[] = wildcardPathsFromLevel(expandLevel)
    .concat(expandPaths)
    .filter((path) => typeof path === 'string'); // could be undefined

  const expandedPaths: string[] = [];
  wildcardPaths.forEach((wildcardPath) => {
    const keyPaths: string[] = wildcardPath.split('.');
    const populatePaths = (curData: unknown, curPath: string, depth: number) => {
      if (depth === keyPaths.length) {
        expandedPaths.push(curPath);
        return;
      }
      const key = keyPaths[depth];
      if (depth === 0) {
        if (
          hasChildNodes(curData, dataIterator)
          && (key === DEFAULT_ROOT_PATH || key === WILDCARD)
        ) {
          populatePaths(curData, DEFAULT_ROOT_PATH, depth + 1);
        }
      } else if (key === WILDCARD) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of dataIterator(curData)) {
          if (hasChildNodes(item.data, dataIterator)) {
            populatePaths(item.data, `${curPath}.${item.name}`, depth + 1);
          }
        }
      } else {
        const value = getPropertyValue(curData, key);
        if (hasChildNodes(value, dataIterator)) {
          populatePaths(value, `${curPath}.${key}`, depth + 1);
        }
      }
    };

    populatePaths(data, '', 0);
  });

  const obj = { ...prevExpandedPaths };
  expandedPaths.forEach((d) => {
    obj[d] = true;
  });
  return obj;
};
