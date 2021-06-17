import { IDataTypeSetup } from '@/commons/types';
import imageTypeSetup from './image';
import videoTypeSetup from './video';
import textTypeSetup from './text';
import textWithTableTypeSetup from './text-with-table';

export default [
  imageTypeSetup,
  videoTypeSetup,
  textTypeSetup,
  textWithTableTypeSetup,
] as IDataTypeSetup[];
