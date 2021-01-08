/**
 * functions for generating img url
 * @namespace
 */

import {
  PROTOCOL,
  IP,
  SERVER_PORT,
} from './http-params';

// image url formatter
export default (filePath: string): string => (
  `${PROTOCOL}://${IP}:${SERVER_PORT}/img/${filePath}`
);
