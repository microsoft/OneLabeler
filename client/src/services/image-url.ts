/**
 * functions for generating img url
 * @namespace
 */

import {
  PROTOCOL,
  IP,
  PORT,
} from './http-params';

// image url formatter
export default (filePath: string): string => (
  `${PROTOCOL}://${IP}:${PORT}/img/${filePath}`
);
