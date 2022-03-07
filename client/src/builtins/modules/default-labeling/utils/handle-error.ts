import type { AxiosError, AxiosResponse } from 'axios';

const bindErrorHandler = (response: Promise<AxiosResponse>) => {
  response.catch((e: AxiosError) => {
    if (e.request !== undefined && e.response === undefined) {
      // The service cannot be connected.
      throw new TypeError('Cannot Connect to Default Labeling Server');
    } else {
      throw e;
    }
  });
  return response;
};

export default bindErrorHandler;
