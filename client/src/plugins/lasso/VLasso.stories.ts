// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Story } from '@storybook/vue';
import VLasso from './VLasso.vue';

export default {
  title: 'Visualization/lasso',
  component: VLasso,
};

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VLasso },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VLasso v-bind="$props" />
    </svg>
  `,
});

export const Basic = Template.bind({});
Basic.args = {
  width: 500,
  height: 300,
  closingDistance: 75,
};
