declare module jsfive {
  class Dataset { }
  class File {
    constructor(fh: ArrayBuffer, filename: string) { }
    get(y: string): { shape: number[], value: number[] }
  }
  class Group { }
}

export = jsfive;
