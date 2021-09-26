import axios from 'axios';
import showProgressBar from '@/plugins/nprogress-interceptor';
import { WorkflowGraph } from '@/commons/types';
import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from './http-params';

const formatter = () => `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/compile`;

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
const compile = showProgressBar(async (
  workflow: WorkflowGraph,
): Promise<void> => {
  const response = await axios.post(
    formatter(),
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

export default compile;
