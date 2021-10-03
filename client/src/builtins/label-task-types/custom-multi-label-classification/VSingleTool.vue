<template>
  <div style="display: flex">
    <!-- The column selector. -->
    <VColumnMenu
      :label-columns="labelColumns"
      :columns="columns"
      :disabled="disabled"
      @set:label-columns="$emit('upsert:label', { columns: $event })"
    />

    <v-divider
      class="mx-1"
      vertical
    />

    <!-- The question selector -->
    <VQueryMenu
      :label-queries="labelQueries"
      :queries="queries"
      :disabled="disabled"
      @set:label-queries="$emit('upsert:label', { queries: $event })"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import VColumnMenu from './VColumnMenu.vue';
import VQueryMenu from './VQueryMenu.vue';

type Query = {
  text: string;
  back_text: string;
  related_attr: string[];
  type: string;
}

interface IDataObject {
  uuid: string;
  content: {
    table: Record<string, unknown>[];
    queries: Query[];
  };
}

interface ILabel {
  uuid: string;
  columns: string[];
  queries: Query[];
}

const isSuperset = (set: string[], subset: string[]) => (
  [...subset].every((d) => set.includes(d))
);

export default Vue.extend({
  name: 'VSingleTool',
  components: { VColumnMenu, VQueryMenu },
  props: {
    dataObject: {
      type: Object as PropType<IDataObject | null>,
      default: null,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    columns(): string[] {
      const { dataObject } = this;
      const table = dataObject?.content.table ?? [];
      if (table.length === 0) return [];
      return Object.keys(table[0]).filter((d) => d !== '');
    },
    queries(): Query[] {
      const { dataObject, labelColumns } = this;
      const candidateQueries = dataObject?.content.queries ?? [];
      const queries = candidateQueries
        .filter((d) => (
          isSuperset(labelColumns ?? [], d.related_attr)
          && isSuperset(d.related_attr, labelColumns ?? [])
        ));
      return queries;
    },
    labelColumns(): string[] | null {
      return this.label?.columns ?? null;
    },
    labelQueries(): Query[] | null {
      return this.label?.queries ?? null;
    },
  },
});
</script>
