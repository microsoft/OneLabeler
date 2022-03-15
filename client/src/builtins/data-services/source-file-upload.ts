// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SourceType } from '@/commons/types';

export default {
  type: SourceType.FileUpload,
  label: 'File Upload',
  api: 'FileUpload',
  id: 'FileUpload',
  isBuiltIn: true,
  isServerless: true,
};
