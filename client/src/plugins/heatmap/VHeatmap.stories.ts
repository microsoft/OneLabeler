import { Story } from '@storybook/vue';
import VHeatmap, { BinDatum } from './VHeatmap.vue';

export default {
  title: 'Visualization/heatmap',
  component: VHeatmap,
};

type Datum = { x: number, y: number };
const len = 100;
const data = Array(len).fill(null)
  .map(() => ({ x: Math.random(), y: Math.random() }));

const BasicTemplate: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VHeatmap },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VHeatmap v-bind="$props" />
    </svg>
  `,
});

export const Basic = BasicTemplate.bind({});
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
  nRows: 10,
  nColumns: 10,
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
};

const ObserveCellClickTemplate: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VHeatmap },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VHeatmap v-bind="$props">
        <template #cell="slotProps">
          <rect
            v-bind="slotProps"
            stroke="white"
            stroke-width="1"
            @click="$props.onClickCell(slotProps.datum)"
          />
        </template>
      </VHeatmap>
    </svg>
  `,
});

export const ObserveCellClick = ObserveCellClickTemplate.bind({});
ObserveCellClick.args = {
  ...Basic.args,
  onClickCell: (d: BinDatum) => console.log(d),
};

const CircleCellsTemplate: Story = (args, { argTypes }) => ({
  props: Object.keys(argTypes),
  components: { VHeatmap },
  template: `
    <svg
      :width="$props.width"
      :height="$props.height"
    >
      <VHeatmap v-bind="$props">
        <template #cell="slotProps">
          <circle
            :r="Math.min(slotProps.width, slotProps.height) / 2"
            :cx="slotProps.x + slotProps.width / 2"
            :cy="slotProps.y + slotProps.height / 2"
            :fill="slotProps.fill"
            stroke="white"
            stroke-width="1"
          />
        </template>
      </VHeatmap>
    </svg>
  `,
});

export const CircleCells = CircleCellsTemplate.bind({});
CircleCells.args = { ...Basic.args };
