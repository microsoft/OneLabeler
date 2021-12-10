import * as tf from '@tensorflow/tfjs';
import MnistData from './mnist';
import {
  DataType,
  LabelTaskType,
  ModuleType,
} from '@/commons/types';
import type {
  IImage,
  ILabel,
  IDataObjectStorage,
} from '@/commons/types';

// Reference: https://www.tensorflow.org/js/tutorials/training/handwritten_digit_cnn

const getModel = (): tf.Sequential => {
  const model = tf.sequential();

  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const IMAGE_CHANNELS = 1;

  // In the first layer of our convolutional neural network we have
  // to specify the input shape. Then we specify some parameters for
  // the convolution operation that takes place in this layer.
  model.add(tf.layers.conv2d({
    inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
    kernelSize: 5,
    filters: 8,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling',
  }));

  // The MaxPooling layer acts as a sort of downsampling using max values
  // in a region instead of averaging.
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  // Repeat another conv2d + maxPooling stack.
  // Note that we have more filters in the convolution.
  model.add(tf.layers.conv2d({
    kernelSize: 5,
    filters: 16,
    strides: 1,
    activation: 'relu',
    kernelInitializer: 'varianceScaling',
  }));
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }));

  // Now we flatten the output from the 2D filters into a 1D vector to prepare
  // it for input into our last layer. This is common practice when feeding
  // higher dimensional data to a final classification output layer.
  model.add(tf.layers.flatten());

  // Our last layer is a dense layer which has 10 output units, one for each
  // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9).
  const NUM_OUTPUT_CLASSES = 10;
  model.add(tf.layers.dense({
    units: NUM_OUTPUT_CLASSES,
    kernelInitializer: 'varianceScaling',
    activation: 'softmax',
  }));

  // Choose an optimizer, loss function and accuracy metric,
  // then compile and return the model
  const optimizer = tf.train.adam();
  model.compile({
    optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });

  return model;
};

const train = async (model: tf.Sequential, data: MnistData) => {
  const BATCH_SIZE = 512;
  const TRAIN_DATA_SIZE = 5500;
  const TEST_DATA_SIZE = 1000;

  const [trainXs, trainYs] = tf.tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
    return [
      d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]),
      d.labels,
    ];
  });

  const [testXs, testYs] = tf.tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE);
    return [
      d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]),
      d.labels,
    ];
  });

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: 10,
    shuffle: true,
  });
};

const model = getModel();
const data = new MnistData();

const run = async () => {
  await data.load();
  await train(model, data);
  console.log('CNN model finish training');
};
run();

const url2image = (url: string): Promise<HTMLImageElement> => (
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => resolve(img);
  })
);

const url2tensor = async (url: string): Promise<tf.Tensor3D> => {
  const img = await url2image(url);
  const tensor = tf.browser.fromPixels(img, 1);
  return tensor;
};

const urls2tensor = async (urls: string[]): Promise<tf.Tensor4D> => {
  const tensors = await Promise.all(urls.map((d) => url2tensor(d)));
  return tf.stack(tensors, 0) as tf.Tensor4D;
};

export default {
  type: ModuleType.DefaultLabeling,
  label: 'CNN-classification',
  id: 'CNN-classification-438546',
  inputs: ['dataObjects', 'queryUuids'],
  outputs: ['labels'],
  isAlgorithmic: true,
  isBuiltIn: true,
  isServerless: true,
  dataTypes: [DataType.Image],
  labelTasks: [LabelTaskType.Classification],
  run: async (
    inputs: {
      dataObjects: IDataObjectStorage,
      queryUuids: string[],
    },
  ): Promise<{ labels: ILabel[] }> => {
    const dataObjects = await inputs.dataObjects.getBulk(inputs.queryUuids) as IImage[];
    const urls = dataObjects.map((d) => d.content) as string[];
    const xs = await urls2tensor(urls);
    const preds = (model.predict(xs) as tf.Tensor).argMax(-1).dataSync();
    const labels = [...preds].map((d, i) => ({
      uuid: dataObjects[i].uuid,
      category: String(d),
    }));
    return { labels };
  },
};
