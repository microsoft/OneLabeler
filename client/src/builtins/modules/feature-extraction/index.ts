// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import ImageBow from './image-bow';
import ImageLda from './image-lda';
import ImageSvd from './image-svd';
import Random3d from './random3d';
import TextNmf from './text-nmf';
// import Mobilenet from './mobilenet';

/*
export default [
  new ImageBOW(),
  new ImageLDA(),
  new ImageSVD(),
  new Random3D(),
  new TextNMF(),
  new MobilenetEmbedding(),
];
*/

export default [
  ImageBow,
  ImageLda,
  ImageSvd,
  Random3d,
  TextNmf,
  // Mobilenet,
];
