// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import type { StateNames } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

type RunReturn = unknown;

/** Implement your custom run function below. */
const run = async (
  inputs: Record<string, StateNames>,
): Promise<RunReturn> => {
  console.log(inputs);
  const response = await axios.post(
    `${ALGORITHM_URL}/features/image/SVD`,
    JSON.stringify({}),
  );
  return response.data as RunReturn;
};

export default run;
