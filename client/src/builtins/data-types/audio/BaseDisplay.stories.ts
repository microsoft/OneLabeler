import { Story } from '@storybook/vue';
import vuetify from '@/vuetify';
import BaseDisplay from './BaseDisplay.vue';

// TODO: figure out why waveform is not rendered

export default {
  title: 'DataType/audio',
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

export const GithubAudio = Template.bind({});
GithubAudio.args = {
  dataObject: {
    // content: 'https://github.com/mdn/webaudio-examples/blob/master/audio-analyser/viper.mp3?raw=true',
  },
};
