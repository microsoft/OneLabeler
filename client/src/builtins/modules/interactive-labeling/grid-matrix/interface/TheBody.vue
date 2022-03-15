<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="display: flex; flex-direction: column;">
    <!-- The grid matrix. -->
    <div
      class="grids-container"
      :style="{
        'grid-template-columns': `repeat(${itemsPerRow}, 1fr)`,
        'grid-template-rows': `repeat(${itemsPerCol}, 1fr)`,
      }"
    >
      <VGrid
        v-for="i in indicesInPage"
        :key="i"
        :data-type="dataType"
        :label-tasks="labelTasks"
        :data-object="dataObjects[i]"
        :label="labels[i]"
        :label2color="label2color"
        :status="statuses[i]"
        :category-tasks="categoryTasks"
        :title="''"
        :is-selected="selectedUuids.includes(dataObjects[i].uuid)"
        @click:grid="$emit('click:grid', dataObjects[i], $event)"
        @upsert:labels="$emit(
          'upsert:labels',
          { uuid: dataObjects[i].uuid, ...$event },
        )"
      />
    </div>

    <!-- The pagination when the data objects cannot show in one page. -->
    <template v-if="enablePagination">
      <v-pagination
        v-model="page"
        :length="nPages"
        :total-visible="Math.min(5, nPages)"
      />
    </template>
  </div>
</template>

<script lang="ts">
/** The interface module showing data objects in a matrix of grids. */

import {
  computed,
  defineComponent,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';
import type {
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import type {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
} from '@/commons/types';
import VGrid from './VGrid.vue';

export default defineComponent({
  name: 'TheBody',
  components: { VGrid },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      // When grid matrix is activate while the label task does not include classification,
      // the passed labels can be undefined
      type: Array as PropType<(ILabel | undefined)[]>,
      required: true,
    },
    statuses: {
      type: Array as PropType<StatusType[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    selectedUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    itemsPerRow: {
      type: Number,
      default: 1,
      validator: (value: number) => Number.isInteger(value) && value >= 1,
    },
    itemsPerCol: {
      type: Number,
      default: 1,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  emits: {
    'click:grid': null,
    'upsert:labels': null,
  },
  setup(props) {
    const { dataObjects, itemsPerCol, itemsPerRow } = toRefs(props);

    const page: Ref<number> = ref(1);

    const itemsPerPage: ComputedRef<number> = computed(
      () => itemsPerRow.value * itemsPerCol.value,
    );
    const nDataObjects: ComputedRef<number> = computed(
      () => dataObjects.value.length,
    );
    const nPages: ComputedRef<number> = computed(
      () => Math.ceil(nDataObjects.value / itemsPerPage.value),
    );
    const enablePagination: ComputedRef<boolean> = computed(
      () => nPages.value >= 2,
    );

    // When the data objects are updated, move to the first page.
    watch(dataObjects, () => { page.value = 1; });

    const indicesInPage: ComputedRef<number[]> = computed(() => (
      [...Array(nDataObjects.value).keys()].filter((i: number) => (
        ((page.value - 1) * itemsPerPage.value <= i)
        && (i < page.value * itemsPerPage.value)
      ))
    ));

    return {
      page,
      nPages,
      indicesInPage,
      enablePagination,
    };
  },
});
</script>

<style lang="scss" scoped>
.grids-container {
  $margin: 4px;
  flex: 1 1 auto;
  display: grid;
  gap: $margin;
  margin: $margin;
}
</style>
