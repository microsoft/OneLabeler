<template>
  <div ref="container">
    <!-- Note: use position absolute to allow container to have responsive size. -->
    <div style="position: absolute;">
      <!-- Note: need align-content: flex-start
        to let the grids float to top left when the number of grids
        is less than the allocated cells. -->
      <div
        ref="grids"
        style="display: flex; flex-wrap: wrap; align-content: flex-start;"
      >
        <div
          v-for="i in indicesInPage"
          :key="dataObjects[i].uuid"
          :style="{
            'padding': `${padding}px`,
            'width': `${100/itemsPerRow}%`,
            'height': `${100/itemsPerCol}%`,
          }"
        >
          <VGrid
            :data-type="dataType"
            :label-tasks="labelTasks"
            :data-object="dataObjects[i]"
            :label="labels[i]"
            :label2color="label2color"
            :status="statuses[i]"
            :category-tasks="categoryTasks"
            :title="''"
            :is-selected="selectedUuids.includes(dataObjects[i].uuid)"
            :height="Math.max(gridHeight - 2 * padding, 0)"
            :width="Math.max(gridWidth - 2 * padding, 0)"
            @click:grid="$emit('click:grid', dataObjects[i], $event)"
            @upsert:label="$emit('upsert:label', dataObjects[i].uuid, $event)"
          />
        </div>
      </div>
      <template v-if="enablePagination">
        <div ref="pagination">
          <v-pagination
            v-model="page"
            :length="nPages"
            :total-visible="Math.min(5, nPages)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * The component for rendering a list of data objects
 * as a matrix of grids.
 */

import {
  computed,
  defineComponent,
  ref,
  toRefs,
  onMounted,
  watch,
  ComputedRef,
  PropType,
  Ref,
} from '@vue/composition-api';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
} from '@/commons/types';
import useResizeObserver from '@/components/composables/useResizeObserver';
import VGrid from './VGrid.vue';

export default defineComponent({
  name: 'VGridMatrix',
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
      default: 2,
      validator: (value: number) => Number.isInteger(value) && value >= 1,
    },
    itemsPerCol: {
      type: Number,
      default: 3,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  setup(props) {
    const { dataObjects, itemsPerCol, itemsPerRow } = toRefs(props);

    const container: Ref<HTMLElement | null> = ref(null);
    const pagination: Ref<HTMLElement | null> = ref(null);
    const grids: Ref<HTMLElement | null> = ref(null);

    const gridHeight: Ref<number> = ref(0);
    const gridWidth: Ref<number> = ref(0);
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

    const updateGridSize = (): void => {
      if (container.value === null) return;
      if (grids.value === null) return;
      const height = container.value.clientHeight;
      const width = container.value.clientWidth;
      let paginationHeight = 0;
      if (enablePagination.value && pagination.value !== null) {
        paginationHeight = pagination.value.clientHeight;
      }
      gridHeight.value = (height - paginationHeight) / itemsPerCol.value;
      gridWidth.value = width / itemsPerRow.value;
    };

    onMounted(updateGridSize);
    useResizeObserver(container, updateGridSize);
    watch(itemsPerRow, updateGridSize);
    watch(itemsPerCol, updateGridSize);
    watch(dataObjects, () => { page.value = 1; });

    const indicesInPage: ComputedRef<number[]> = computed(() => (
      [...Array(nDataObjects.value).keys()].filter((i: number) => (
        ((page.value - 1) * itemsPerPage.value <= i)
        && (i < page.value * itemsPerPage.value)
      ))
    ));

    return {
      container,
      pagination,
      grids,
      gridHeight,
      gridWidth,
      page,
      nPages,
      indicesInPage,
      enablePagination,
    };
  },
  data() {
    return { padding: 4 };
  },
});
</script>
