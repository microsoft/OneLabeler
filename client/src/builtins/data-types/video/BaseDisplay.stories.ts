import vuetify from '@/vuetify';
import BaseDisplay from './BaseDisplay.vue';

export default {
  title: 'DataType/video',
  component: BaseDisplay,
  argTypes: {
    dataObject: {
      control: { type: 'object' },
    },
  },
};

const Template = (args, { argTypes }) => ({
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

export const GithubVideo = Template.bind({});
GithubVideo.args = {
  dataObject: { content: 'https://github.com/mdn/interactive-examples/blob/master/live-examples/media/cc0-videos/friday.mp4?raw=true' },
};
