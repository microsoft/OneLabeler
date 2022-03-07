<template>
  <div style="display: flex">
    <!-- The column selector. -->
    <VColumnMenu
      :label-columns="labelColumns"
      :columns="columns"
      :disabled="disabled"
      @set:label-columns="$emit('upsert:labels', { columns: $event })"
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
      @set:label-queries="$emit('upsert:labels', { queries: $event })"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Query, IDataObject, ILabel } from '../../types';
import VColumnMenu from './VColumnMenu.vue';
import VQueryMenu from './VQueryMenu.vue';

const isSuperset = (set: string[], subset: string[]) => (
  [...subset].every((d) => set.includes(d))
);

export default defineComponent({
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
  emits: {
    'upsert:labels': null,
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
