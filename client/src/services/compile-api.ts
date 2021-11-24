import axios from 'axios';
import showProgressBar from '@/plugins/nprogress-interceptor';
import type { WorkflowGraph } from '@/commons/types';
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

/** Evoke the compile service. */
const compile = showProgressBar(async (
  workflow: WorkflowGraph,
  url: string,
  filename: string,
): Promise<void> => {
  const response = await axios.post(
    url,
    JSON.stringify({ workflow }),
    // Parse the response data as blob
    // instead of the default as a string
    // (alternatively parse as arraybuffer also works).
    { responseType: 'blob' },
  );
  const blob = new Blob([response.data]);
  const objectUrl = window.URL.createObjectURL(blob);
  download(objectUrl, filename);
});

/** Compile an installer given the labeling tool's workflow. */
export const compileInstaller = (workflow: WorkflowGraph): Promise<void> => (
  compile(
    workflow,
    formatter('exe'),
    'labeling-tool-installer.exe',
  )
);

/** Compile a zip of the bundled code given the labeling tool's workflow. */
export const compileBundleZip = (workflow: WorkflowGraph): Promise<void> => (
  compile(
    workflow,
    formatter('zip/bundle'),
    'labeling-tool-bundle.zip',
  )
);

/** Compile a zip of the source code given the labeling tool's workflow. */
export const compileSourceZip = (workflow: WorkflowGraph): Promise<void> => (
  compile(
    workflow,
    formatter('zip/source'),
    'labeling-tool-source.zip',
  )
);
