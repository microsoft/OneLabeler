import { Story } from '@storybook/vue';
import vuetify from '@/vuetify';
import BaseDisplay from './BaseDisplay.vue';

export default {
  title: 'DataType/youtube-video',
  component: BaseDisplay,
  argTypes: {
    dataObject: {
      control: { type: 'object' },
    },
  },
};

const Template: Story = (args, { argTypes }) => ({
  // reference: https://github.com/storybookjs/storybook/issues/13532#issuecomment-767726219
  vuetify,
  props: Object.keys(argTypes),
  components: { BaseDisplay },
  template: `
    <div style="width: 500px; height: 300px; display: flex">
      <BaseDisplay style="flex: 1 1 auto;" v-bind="$props" />
    </div>
    `,
});

export const Youtube = Template.bind({});
Youtube.args = {
  dataObject: { content: 'https://www.youtube.com/watch?v=qS6LoRYUdhw' },
};
