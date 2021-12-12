import type { Story } from '@storybook/vue';
import type { IDataObject } from './index';
import BaseDisplay from './BaseDisplay.vue';

export default {
  title: 'DataType/customDataType',
  component: BaseDisplay,
  argTypes: {
    dataObject: {
      control: { type: 'object' },
    },
  },
};

const Template: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { BaseDisplay },
  template: '<BaseDisplay v-bind="$props" />',
});

export const Test = Template.bind({});
Test.args = {
  dataObject: { content: 'put suitable content here' } as IDataObject,
};
