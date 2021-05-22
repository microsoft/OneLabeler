/**
 * functions for generating img url
 * @namespace
 */

import {
  PROTOCOL_ALGO,
  IP_ALGO,
  PORT_ALGO,
} from './http-params';

// image url formatter
export default (filePath: string): string => (
  `${PROTOCOL_ALGO}://${IP_ALGO}:${PORT_ALGO}/img/${filePath}`
);
