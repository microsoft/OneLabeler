import axios from 'axios';
import showProgressBar from '@/plugins/nprogress-interceptor';
import { WorkflowGraph } from '@/commons/types';
import { ALGORITHM_URL } from '@/services/http-params';

const formatter = (method: string) => `${ALGORITHM_URL}/compile/${method}`;

/** Download a file from the given url. */
const download = (
  url: string,
  filename: string,
): void => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
};

/** Compile an installer given the labeling tool's workflow. */
export const compileInstaller = showProgressBar(async (
  workflow: WorkflowGraph,
): Promise<void> => {
  const response = await axios.post(
    formatter('exe'),
    JSON.stringify({ workflow }),
    // Parse the response data as blob
    // instead of the default as a string
    // (alternatively parse as arraybuffer also works).
    { responseType: 'blob' },
  );
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const filename = 'labeling-tool-installer.exe';
  download(url, filename);
});

/** Compile a zip of the bundled code given the labeling tool's workflow. */
export const compileBundleZip = showProgressBar(async (
  workflow: WorkflowGraph,
): Promise<void> => {
  const response = await axios.post(
    formatter('zip/bundle'),
    JSON.stringify({ workflow }),
    // Parse the response data as blob
    // instead of the default as a string
    // (alternatively parse as arraybuffer also works).
    { responseType: 'blob' },
  );
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const filename = 'labeling-tool-bundle.zip';
  download(url, filename);
});

/** Compile a zip of the source code given the labeling tool's workflow. */
export const compileSourceZip = showProgressBar(async (
  workflow: WorkflowGraph,
): Promise<void> => {
  const response = await axios.post(
    formatter('zip/source'),
    JSON.stringify({ workflow }),
    // Parse the response data as blob
    // instead of the default as a string
    // (alternatively parse as arraybuffer also works).
    { responseType: 'blob' },
  );
  const blob = new Blob([response.data]);
  const url = window.URL.createObjectURL(blob);
  const filename = 'labeling-tool-source.zip';
  download(url, filename);
});
