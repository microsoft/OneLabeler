// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { polygonContains } from 'd3';
import { Story } from '@storybook/vue';
import VScatterplot from './VScatterplot.vue';
import VLasso from '../lasso/VLasso.vue';

export default {
  title: 'Visualization/scatterplot',
  component: VScatterplot,
};

type Datum = { x: number, y: number };
const len = 100;
const data = Array(len).fill(null)
  .map(() => ({ x: Math.random(), y: Math.random() }));

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VScatterplot },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VScatterplot v-bind="$props" />
    </svg>
  `,
});

export const Basic = Template.bind({});
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
  xAxis: {
    label: 'x',
    tickNum: 10,
    domain: [0, 1],
  },
  yAxis: {
    label: 'y',
    tickNum: 10,
    domain: [0, 1],
  },
  xMap: (d: Datum) => d.x,
  yMap: (d: Datum) => d.y,
  rMap: () => 3,
  fillMap: () => 'red',
  strokeMap: () => 'black',
};

const LassoTemplate: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VScatterplot, VLasso },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VScatterplot v-bind="$props" />
      <VLasso
        :width="$props.width"
        :height="$props.height"
        @lasso:end="$props.getSelectedIndices($event)"
      />
    </svg>
  `,
});

type Point = [number, number];
type Polygon = Point[];

export const Lasso = LassoTemplate.bind({});
Lasso.args = {
  ...Basic.args,
  getSelectedIndices(lassoPolygon: Polygon): number[] {
    const svg = document.getElementsByTagName('svg')[0];
    const selectedIndices: number[] = [];
    [...svg.getElementsByTagName('circle')]
      .forEach((d: SVGCircleElement, i: number) => {
        const x = +(d.getAttribute('cx') as string);
        const y = +(d.getAttribute('cy') as string);
        if (polygonContains(lassoPolygon, [x, y])) {
          selectedIndices.push(i);
        }
      });
    console.log(selectedIndices);
    return selectedIndices;
  },
};
