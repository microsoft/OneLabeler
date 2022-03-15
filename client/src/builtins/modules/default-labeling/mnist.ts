// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *
 * @reference
 * https://storage.googleapis.com/tfjs-tutorials/mnist_data.js
 */

import * as tf from '@tensorflow/tfjs';

const IMAGE_SIZE = 784;
const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;

const NUM_TRAIN_ELEMENTS = 55000;
const NUM_TEST_ELEMENTS = NUM_DATASET_ELEMENTS - NUM_TRAIN_ELEMENTS;

const MNIST_IMAGES_SPRITE_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png';
const MNIST_LABELS_PATH = 'https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8';

const nextBatch = (
  batchSize: number,
  data: [Float32Array, Uint8Array],
  index: () => number,
): { xs: tf.Tensor2D, labels: tf.Tensor2D } => {
  const batchImagesArray = new Float32Array(batchSize * IMAGE_SIZE);
  const batchLabelsArray = new Uint8Array(batchSize * NUM_CLASSES);

  for (let i = 0; i < batchSize; i += 1) {
    const idx = index();

    const image = data[0].slice(idx * IMAGE_SIZE, idx * IMAGE_SIZE + IMAGE_SIZE);
    batchImagesArray.set(image, i * IMAGE_SIZE);

    const label = data[1].slice(idx * NUM_CLASSES, idx * NUM_CLASSES + NUM_CLASSES);
    batchLabelsArray.set(label, i * NUM_CLASSES);
  }

  const xs = tf.tensor2d(batchImagesArray, [batchSize, IMAGE_SIZE]);
  const labels = tf.tensor2d(batchLabelsArray, [batchSize, NUM_CLASSES]);

  return { xs, labels };
};

/**
* A class that fetches the sprited MNIST dataset and returns shuffled batches.
*
* NOTE: This will get much easier. For now, we do data fetching and
* manipulation manually.
*/
export default class MnistData {
  shuffledTrainIndex: number;

  shuffledTestIndex: number;

  datasetImages: Float32Array | null;

  datasetLabels: Uint8Array | null;

  trainIndices: Uint32Array | null;

  testIndices: Uint32Array | null;

  trainImages: Float32Array | null;

  testImages: Float32Array | null;

  trainLabels: Uint8Array | null;

  testLabels: Uint8Array | null;

  constructor() {
    this.shuffledTrainIndex = 0;
    this.shuffledTestIndex = 0;
    this.datasetImages = null;
    this.datasetLabels = null;
    this.trainIndices = null;
    this.testIndices = null;
    this.trainImages = null;
    this.testImages = null;
    this.trainLabels = null;
    this.testLabels = null;
  }

  async load(): Promise<void> {
    // Make a request for the MNIST sprited image.
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imgRequest = new Promise<void>((resolve) => {
      img.crossOrigin = '';
      img.onload = () => {
        if (ctx === null) return;

        img.width = img.naturalWidth;
        img.height = img.naturalHeight;

        const datasetBytesBuffer = new ArrayBuffer(NUM_DATASET_ELEMENTS * IMAGE_SIZE * 4);

        const chunkSize = 5000;
        canvas.width = img.width;
        canvas.height = chunkSize;

        for (let i = 0; i < NUM_DATASET_ELEMENTS / chunkSize; i += 1) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * IMAGE_SIZE * chunkSize * 4,
            IMAGE_SIZE * chunkSize,
          );
          ctx.drawImage(
            img,
            0,
            i * chunkSize,
            img.width,
            chunkSize,
            0,
            0,
            img.width,
            chunkSize,
          );

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          for (let j = 0; j < imageData.data.length / 4; j += 1) {
            // All channels hold an equal value since the image is grayscale, so
            // just read the red channel.
            datasetBytesView[j] = imageData.data[j * 4] / 255;
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer);

        resolve();
      };
      img.src = MNIST_IMAGES_SPRITE_PATH;
    });

    const labelsRequest = fetch(MNIST_LABELS_PATH);
    await imgRequest;
    const labelsResponse = await labelsRequest;

    this.datasetLabels = new Uint8Array(await labelsResponse.arrayBuffer());

    // Create shuffled indices into the train/test set for when we select a
    // random dataset element for training / validation.
    this.trainIndices = tf.util.createShuffledIndices(NUM_TRAIN_ELEMENTS);
    this.testIndices = tf.util.createShuffledIndices(NUM_TEST_ELEMENTS);

    // Slice the the images and labels into train and test sets.
    this.trainImages = this.datasetImages?.slice(0, IMAGE_SIZE * NUM_TRAIN_ELEMENTS) ?? null;
    this.testImages = this.datasetImages?.slice(IMAGE_SIZE * NUM_TRAIN_ELEMENTS) ?? null;
    this.trainLabels = this.datasetLabels.slice(0, NUM_CLASSES * NUM_TRAIN_ELEMENTS);
    this.testLabels = this.datasetLabels.slice(NUM_CLASSES * NUM_TRAIN_ELEMENTS);
  }

  nextBatch = nextBatch;

  nextTrainBatch(batchSize: number): {
    xs: tf.Tensor2D;
    labels: tf.Tensor2D;
  } {
    if (this.trainImages === null) throw Error('Train images unavailable.');
    if (this.trainLabels === null) throw Error('Train labels unavailable.');

    return this.nextBatch(
      batchSize,
      [this.trainImages, this.trainLabels],
      () => {
        if (this.trainIndices === null) throw Error('Train indices unavailable.');
        this.shuffledTrainIndex = (this.shuffledTrainIndex + 1) % this.trainIndices.length;
        return this.trainIndices[this.shuffledTrainIndex];
      },
    );
  }

  nextTestBatch(batchSize: number): {
    xs: tf.Tensor2D;
    labels: tf.Tensor2D;
  } {
    if (this.testImages === null) throw Error('Test images unavailable.');
    if (this.testLabels === null) throw Error('Test labels unavailable.');

    return this.nextBatch(
      batchSize,
      [this.testImages, this.testLabels],
      () => {
        if (this.testIndices === null) throw Error('Test indices unavailable.');
        this.shuffledTestIndex = (this.shuffledTestIndex + 1) % this.testIndices.length;
        return this.testIndices[this.shuffledTestIndex];
      },
    );
  }
}
