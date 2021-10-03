<template>
  <div
    :style="{
      width: widthStr,
      height: heightStr,
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
    }"
  >
    <!-- The data table. -->
    <v-simple-table>
      <thead>
        <tr>
          <th
            v-for="attr in attributes"
            :key="attr"
            class="text-left"
          >
            {{ attr }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, i) in table"
          :key="i"
        >
          <td
            v-for="attr in attributes"
            :key="attr"
          >
            {{ item[attr] }}
          </td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IDataObject } from '@/commons/types';

interface ITable extends IDataObject {
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    table: Record<string, number | string>[];
  };
}

export default Vue.extend({
  name: 'VDisplay',
  props: {
    /** The data object to be rendered. */
    dataObject: {
      type: Object as PropType<ITable>,
      required: true,
    },
    /** The width of the svg as a number or string of form '...%'. */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /** The height of the svg as a number or string of form '...%'. */
    height: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
  },
  computed: {
    widthStr(): string {
      const { width } = this;
      if (typeof width === 'number') return `${width}px`;
      return width;
    },
    heightStr(): string {
      const { height } = this;
      if (typeof height === 'number') return `${height}px`;
      return height;
    },
    table() {
      return this.dataObject.content.table;
    },
    attributes(): string[] {
      const { table } = this;
      if (table.delength === 0) return [];
      return Object.keys(table[0]);
    },
  },
});
</script>
