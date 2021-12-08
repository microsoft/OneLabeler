import * as d3 from 'd3';
import { randomShuffle } from '@/plugins/random';
import { IDataObject, ModuleType } from '@/commons/types';

interface ITable extends IDataObject {
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    table: Record<string, number | string>[];
  };
}

/** Get the extension name from the filename. */
const getExt = (filename: string): string => {
  const ext = filename.split('.').pop() as string;
  return filename === ext ? '' : ext;
};

/** Get the filename with extension name trimmed. */
const trimExt = (filename: string): string => (
  filename.replace(/\.[^/.]+$/, '')
);

type Table = Record<string, string | number>[];

export default {
  type: ModuleType.Custom,
  label: 'Load Data Objects',
  id: 'Custom-19914055',
  inputs: [],
  outputs: ['dataObjects'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isModelBased: false,
  isServerless: true,
  run: async (): Promise<{ dataObjects: ITable[] }> => {
    const fileNames = await d3.json('./assets/catalog.json') as string[];
    const pairs: Record<string, { table: unknown, queries: unknown }> = {};
    await Promise.all(fileNames.map(async (name: string) => {
      const ext = getExt(name);
      const nameTrimmed = trimExt(name);
      if (!(nameTrimmed in pairs)) {
        pairs[nameTrimmed] = { table: null, queries: null };
      }
      if (ext === 'csv') {
        pairs[nameTrimmed].table = await d3.csv(`./assets/${name}`) as Table;
      } else if (ext === 'json') {
        pairs[nameTrimmed].queries = (await d3.json(`./assets/${name}`)).sentence;
      }
    }));
    const dataObjects = randomShuffle(Object.entries(pairs).map(([key, value]) => ({
      uuid: key,
      content: value,
    })));
    return { dataObjects };
  },
};
