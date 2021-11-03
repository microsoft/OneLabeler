<template>
  <div
    :style="{
      'overflow-y': 'scroll',
      'font-size': '24px',
      'line-height': 'initial',
      'display': 'flex',
      'flex-direction': 'row',
    }"
    @scroll="$emit('scroll', $event)"
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
        <!-- Note: don't use linebreak between the text,
          otherwise a white space will be added -->
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <p ref="textElement">{{ text }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { IDataObject } from '@/commons/types';

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
  name: 'BaseDisplay',
  props: {
    dataObject: {
      type: Object as PropType<ITextWithTable>,
      required: true,
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
  },
  methods: {
    /** Get the text node (needed by span annotation). */
    getTextNode(): Text {
      const textElement = this.$refs.textElement as HTMLElement;
      const textNode = textElement.childNodes[0] as Text;
      return textNode;
    },
  },
});
</script>
