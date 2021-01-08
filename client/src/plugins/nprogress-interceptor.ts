import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/** Show progress bar when the input async function is running. */
export default function showProgressBar<T, K extends unknown[]>(
  func: ((...args: K) => Promise<T>),
) {
  return async (...args: K): Promise<T> => {
    NProgress.start();
    const response = await func(...args);
    NProgress.done();
    return response;
  };
}
