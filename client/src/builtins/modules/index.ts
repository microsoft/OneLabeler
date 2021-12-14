import type { IModule } from '@/commons/types';

// custom modules
import CustomExport from '@/custom/table-qa/modules/custom/export';
import CustomLoad from '@/custom/table-qa/modules/custom/load';

import Initialization from './initialization/base';
import dataObjectSelection from './data-object-selection';
import defaultLabeling from './default-labeling';
import featureExtraction from './feature-extraction';
import interactiveLabeling from './interactive-labeling';
import modelTraining from './model-training';
import stoppageAnalysis from './stoppage-analysis';

/**
 * TODO: [refactor] may store the valid processes at the data type declarations
 * so that given a customized data type, the existing processes can still be reused.
 */

export default [
  Initialization,
  ...dataObjectSelection,
  ...defaultLabeling,
  ...featureExtraction,
  ...interactiveLabeling,
  ...modelTraining,
  ...stoppageAnalysis,
  // custom modules:
  CustomExport,
  CustomLoad,
] as IModule[];
