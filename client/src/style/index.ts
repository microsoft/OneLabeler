// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const card = {
  'background-color': 'white',
  border: 'thin solid rgba(0,0,0,.12)',
  'border-radius': '4px',
};

export const elevation2 = {
  'box-shadow': '0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%) !important',
};

export const cardElevated = {
  ...card,
  ...elevation2,
};

export const subtitle1 = {
  'font-size': '1rem !important',
  'font-weight': 'normal',
  'letter-spacing': '0.009375em !important',
  'line-height': '1.75rem',
  'font-family': '"Roboto", sans-serif !important',
};

export const greyText = {
  color: '#757575 !important',
  'caret-color': '#757575 !important',
};

export const greyBackground = {
  'background-color': '#f5f5f5 !important',
  'border-color': '#f5f5f5 !important',
};

export const cardHeader = {
  ...subtitle1,
  ...greyText,
  ...greyBackground,
  display: 'flex',
  'align-items': 'center',
  'user-select': 'none',
  'border-top-left-radius': 'inherit',
  'border-top-right-radius': 'inherit',
};
