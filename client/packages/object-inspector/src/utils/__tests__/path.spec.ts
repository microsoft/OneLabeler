import { expect } from 'chai';

import { DEFAULT_ROOT_PATH, wildcardPathsFromLevel } from '../path';

const root = DEFAULT_ROOT_PATH;

describe('PathUtils', () => {
  it('wildcardPathsFromLevel works', () => {
    expect(wildcardPathsFromLevel(-1)).equal([]);

    expect(wildcardPathsFromLevel(0)).equal([]);

    expect(wildcardPathsFromLevel(1)).equal([root]);

    expect(wildcardPathsFromLevel(2)).equal([root, `${root}.*`]);

    expect(wildcardPathsFromLevel(3)).equal([
      root,
      `${root}.*`,
      `${root}.*.*`,
    ]);

    expect(wildcardPathsFromLevel(4)).equal([
      root,
      `${root}.*`,
      `${root}.*.*`,
      `${root}.*.*.*`,
    ]);
  });
});
