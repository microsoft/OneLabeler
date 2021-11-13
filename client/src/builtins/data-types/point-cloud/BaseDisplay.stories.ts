import BaseDisplay from './BaseDisplay.vue';

export default {
  title: 'DataType/point-cloud',
  component: BaseDisplay,
  argTypes: {
    dataObject: {
      control: { type: 'object' },
    },
    label: {
      control: { type: 'object' },
    },
    label2color: {
      control: { type: 'function' },
    },
    multiView: {
      control: { type: 'boolean' },
    },
  },
};

const Template = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { BaseDisplay },
  template: `
    <div style="width: 300px; height: 300px; display: flex">
      <BaseDisplay style="flex: 1 1 auto;" v-bind="$props" />
    </div>
    `,
});

const randomPoints = Array(100).fill(null)
  .map(() => [Math.random(), Math.random(), Math.random()]);
const randomLabels = Array(100).fill(null)
  .map(() => {
    const rand = Math.random();
    if (rand <= 0.33) return '0';
    if (rand <= 0.66) return '1';
    return '2';
  });
const label2color = (d: string): string => {
  if (d === '0') return '#FF0000';
  if (d === '1') return '#FFFF00';
  if (d === '2') return '#0000FF';
  return '#000000';
};

export const NoLabels = Template.bind({});
NoLabels.args = {
  dataObject: { content: randomPoints },
  multiView: false,
};

export const WithLabels = Template.bind({});
WithLabels.args = {
  dataObject: { content: randomPoints },
  label: { pointLabels: randomLabels },
  label2color,
  multiView: false,
};
