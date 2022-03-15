// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type { IModule } from '@/commons/types';
import Initialization from './initialization/base';
import dataObjectSelection from './data-object-selection';
import defaultLabeling from './default-labeling';
import featureExtraction from './feature-extraction';
import interactiveLabeling from './interactive-labeling';
import modelTraining from './model-training';
import stoppageAnalysis from './stoppage-analysis';
import labelIdeation from './label-ideation';

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
  ...labelIdeation,
] as IModule[];
