<template>
  <div ref="container">
    <!-- Note: use position absolute to allow container to have responsive size. -->
    <div style="position: absolute;">
      <!-- Note: need align-content: flex-start
        to let the cards float to top left when the number of cards
        is less than the allocated grids. -->
      <div
        ref="labelCards"
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
          <VDataObjectCard
            :data-type="dataType"
            :label-tasks="labelTasks"
            :data-object="dataObjects[i]"
            :label="labels[i]"
            :label2color="label2color"
            :status="statuses[i]"
            :category-tasks="categoryTasks"
            :title="''"
            :is-selected="selectedUuids.includes(dataObjects[i].uuid)"
            :height="Math.max(cardHeight - 2 * padding, 0)"
            :width="Math.max(cardWidth - 2 * padding, 0)"
            @click:card="$emit('click:card', dataObjects[i], $event)"
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
 * The component for rendering a list of items
 * as a matrix of cells in cards.
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
import VDataObjectCard from './VDataObjectCard.vue';

export default defineComponent({
  name: 'VCardMatrix',
  components: { VDataObjectCard },
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
    const labelCards: Ref<HTMLElement | null> = ref(null);

    const cardHeight: Ref<number> = ref(0);
    const cardWidth: Ref<number> = ref(0);
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

    const updateCardSize = (): void => {
      if (container.value === null) return;
      if (labelCards.value === null) return;
      const height = container.value.clientHeight;
      const width = container.value.clientWidth;
      let paginationHeight = 0;
      if (enablePagination.value && pagination.value !== null) {
        paginationHeight = pagination.value.clientHeight;
      }
      cardHeight.value = (height - paginationHeight) / itemsPerCol.value;
      cardWidth.value = width / itemsPerRow.value;
    };

    onMounted(updateCardSize);
    useResizeObserver(container, updateCardSize);
    watch(itemsPerRow, updateCardSize);
    watch(itemsPerCol, updateCardSize);
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
      labelCards,
      cardHeight,
      cardWidth,
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
