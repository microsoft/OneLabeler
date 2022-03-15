// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/** Show progress bar when the input async function is running. */
export default function showProgressBar<T, K extends unknown[]>(
  func: ((...args: K) => Promise<T>),
) {
  return async (...args: K): Promise<T> => {
    NProgress.start();
    let response;
    try {
      response = await func(...args);
      NProgress.done();
    } catch (e) {
      NProgress.done();
      throw e;
    }
    return response;
  };
}
