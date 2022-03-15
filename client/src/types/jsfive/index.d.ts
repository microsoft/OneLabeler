// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable max-classes-per-file */

export class Dataset { }
export class File {
  constructor(fh: ArrayBuffer, filename: string)

  get(y: string): { shape: number[], value: number[] }
}
export class Group { }
