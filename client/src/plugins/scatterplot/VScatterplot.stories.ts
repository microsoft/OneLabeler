import { Story } from '@storybook/vue';
import VScatterplot from './VScatterplot.vue';

export default {
  title: 'Visualization/scatterplot',
  component: VScatterplot,
};

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
type Datum = { x: number, y: number };
const len = 100;
const data = Array(len).fill(null)
  .map(() => ({ x: Math.random(), y: Math.random() }));
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
    extent: [0, 1],
  },
  yAxis: {
    label: 'y',
    tickNum: 10,
    extent: [0, 1],
  },
  xMap: (d: Datum) => d.x,
  yMap: (d: Datum) => d.y,
  rMap: () => 3,
  fillMap: () => 'red',
  strokeMap: () => 'black',
};
