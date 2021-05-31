import { IDataTypeSetup } from '@/commons/types';
import imageTypeSetup from './image';
import textTypeSetup from './text';
// import textWithTableTypeSetup from './text-with-table';

export default [
  imageTypeSetup,
  textTypeSetup,
  // textWithTableTypeSetup,
] as IDataTypeSetup[];
