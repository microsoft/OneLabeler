// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Story } from '@storybook/vue';
import { scaleLinear } from 'd3';
import VAxis, { Orient } from './VAxis.vue';

export default {
  title: 'Visualization/axis',
  component: VAxis,
};

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VAxis },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VAxis
        :orient="$props.orient"
        :scale="$props.scale"
      />
    </svg>
  `,
});

export const AxisLeftScaleLinear = Template.bind({});
AxisLeftScaleLinear.args = {
  width: 300,
  height: 300,
  orient: Orient.Left,
  scale: scaleLinear(),
};

export const AxisLeftScaleLinearNonNumericRange = Template.bind({});
AxisLeftScaleLinearNonNumericRange.args = {
  width: 300,
  height: 300,
  orient: Orient.Left,
  scale: scaleLinear().range([0, '500']),
};
