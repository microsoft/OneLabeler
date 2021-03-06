// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Story } from '@storybook/vue';
import { scaleOrdinal, schemeCategory10 } from 'd3';
import VParallelCoordinates from './VParallelCoordinates.vue';
import cars from './cars.json';

export default {
  title: 'Visualization/parallel-coordinates',
  component: VParallelCoordinates,
};

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VParallelCoordinates },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VParallelCoordinates v-bind="$props" />
    </svg>
  `,
});

export const Basic = Template.bind({});
const len = 100;
const data = Array(len).fill(null)
  .map(() => ({
    x: Math.random(),
    y: Math.random(),
    z: Math.random(),
  }));
Basic.args = {
  data,
  width: 500,
  height: 300,
  margin: {
    top: 20,
    right: 10,
    bottom: 30,
    left: 30,
  },
};

export const CarDataset = Template.bind({});
CarDataset.args = {
  data: cars.map(({ name, ...kept }) => ({ ...kept })),
  width: 500,
  height: 300,
  margin: {
    top: 20,
    right: 10,
    bottom: 30,
    left: 30,
  },
};

const TemplateColorMapping: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VParallelCoordinates },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VParallelCoordinates v-bind="$props">
        <template #line="props">
          <path
            :d="props.d"
            :stroke="$props.strokeMap(props.i)"
          />
        </template>
      </VParallelCoordinates>
    </svg>
  `,
});

const names = [...new Set(cars.map((d) => d.name))];
const scale = scaleOrdinal(schemeCategory10).domain(names);
export const ColorMapping = TemplateColorMapping.bind({});
ColorMapping.args = {
  data: cars.map(({ name, ...kept }) => ({ ...kept })),
  width: 500,
  height: 300,
  margin: {
    top: 20,
    right: 10,
    bottom: 30,
    left: 30,
  },
  strokeMap: (i: number) => scale(cars[i].name),
};
