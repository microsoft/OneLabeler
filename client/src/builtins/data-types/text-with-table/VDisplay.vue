<template>
  <div
    :style="{
      'width': widthStr,
      'height': heightStr,
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
      'display': 'flex',
      'flex-direction': 'row',
    }"
    @scroll="onScroll"
  >
    <div>
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

      <v-divider class="pb-4" />

      <!-- The document to annotate. -->
      <div
        class="px-2"
        style="flex: 1 1 auto;"
      >
        <p ref="textElement">
          {{ text }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  IDataObject,
  ILabel,
  ILabelTextSpan,
} from '@/commons/types';

interface ITextWithTable extends IDataObject {
  /** The content of the data object. */
  content: {
    /** The table stored as a list of objects. */
    table: Record<string, number | string>[];
    /** The sentence accompanying the table. */
    sentence: string;
  };
}

export default Vue.extend({
  name: 'VDisplay',
  props: {
    dataObject: {
      type: Object as PropType<ITextWithTable>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    /** The width of the svg as a number or string of form '...%' */
    width: {
      type: [Number, String],
      default: undefined,
      validator(val) {
        return typeof val === 'number'
          || (typeof val === 'string' && /^([0-9]+)%$/.test(val));
      },
    },
    /** The height of the svg as a number or string of form '...%' */
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
    table() {
      return this.dataObject.content.table;
    },
    text(): string {
      return this.dataObject.content.sentence;
    },
    attributes(): string[] {
      const { table } = this;
      if (table.length === 0) return [];
      return Object.keys(table[0]);
    },
    labelSpans(): ILabelTextSpan[] | null {
      const { label } = this;
      if (label === null) return null;
      if (label.spans === null || label.spans === undefined) return null;
      return label.spans;
    },
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
  },
  methods: {
    /** Get the text node (needed by span annotation). */
    getTextNode(): Text {
      const textElement = this.$refs.textElement as HTMLElement;
      const textNode = textElement.childNodes[0] as Text;
      return textNode;
    },
    onScroll(e: MouseEvent): void {
      this.$emit('scroll', e);
    },
  },
});
</script>
