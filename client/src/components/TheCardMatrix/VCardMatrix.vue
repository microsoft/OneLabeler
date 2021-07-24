<template>
  <div ref="container">
    <!-- Note: need align-content: flex-start
      to let the cards float to top left when the number of cards
      is less than the allocated grids. -->
    <div
      ref="labelCards"
      style="display: flex; flex-wrap: wrap; align-content: flex-start"
    >
      <div
        v-for="i in indicesInPage"
        :key="dataObjects[i].uuid"
        :style="{
          'padding': `${padding}px`,
          'width': `${100/itemsPerRow}%`,
        }"
      >
        <VDataObjectCard
          :data-type="dataType"
          :label-tasks="labelTasks"
          :data-object="dataObjects[i]"
          :label="labels[i]"
          :status="statuses[i]"
          :classes="classes"
          :category-tasks="categoryTasks"
          :title="''"
          :is-selected="selectedUuids.includes(dataObjects[i].uuid)"
          :button-color="getColor(labels[i])"
          :height="Math.max(cardHeight - 2 * padding, 0)"
          :width="Math.max(cardWidth - 2 * padding, 0)"
          @click:card="$emit('click:card', dataObjects[i], $event)"
          @set:label-category="$emit('set:label-category', dataObjects[i], $event)"
          @set:label-multi-category="$emit('set:label-multi-category', dataObjects[i], $event)"
          @set:label-text="$emit('set:label-text', dataObjects[i], $event)"
        />
      </div>
    </div>
    <div v-if="enablePagination">
      <div ref="pagination">
        <v-pagination
          v-model="page"
          :length="nPages"
          :total-visible="Math.min(5, nPages)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/**
 * The component for rendering a list of items
 * as a matrix of cells in cards.
 */

import Vue, { PropType } from 'vue';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
} from '@/commons/types';
import VDataObjectCard from './VDataObjectCard.vue';

export default Vue.extend({
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
    classes: {
      type: Array as PropType<Category[]>,
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
      validator(value) {
        // itemsPerRow must be factor of 12
        // return Number.isInteger(value) && value >= 1 && 12 % value === 0;
        return Number.isInteger(value) && value >= 1;
      },
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
  data() {
    return {
      padding: 4,
      page: 1,
      cardHeight: 0,
      cardWidth: 0,
    };
  },
  computed: {
    itemsPerPage(): number {
      return this.itemsPerRow * this.itemsPerCol;
    },
    nDataObjects(): number {
      return this.dataObjects.length;
    },
    nPages(): number {
      return Math.ceil(this.nDataObjects / this.itemsPerPage);
    },
    enablePagination(): boolean {
      return this.nPages >= 2;
    },
    indicesInPage(): number[] {
      const { nDataObjects, itemsPerPage, page } = this;
      return [...Array(nDataObjects).keys()].filter((i: number) => (
        ((page - 1) * itemsPerPage <= i) && (i < page * itemsPerPage)
      ));
    },
  },
  watch: {
    dataObjects() {
      // Reset the page number to the first page when
      // the data objects to be shown are changed.
      this.page = 1;
    },
  },
  mounted() {
    this.updateCardSize();
  },
  updated() {
    this.updateCardSize();
  },
  methods: {
    updateCardSize() {
      const container = this.$refs.container as HTMLElement;
      const pagination = this.$refs.pagination as HTMLElement;
      const labelCards = this.$refs.labelCards as HTMLElement;
      const height = container.clientHeight;
      const width = container.clientWidth;
      const paginationHeight = this.enablePagination ? pagination.clientHeight : 0;
      labelCards.style.height = `${height - paginationHeight}px`;
      this.cardHeight = (height - paginationHeight) / this.itemsPerCol;
      this.cardWidth = width / this.itemsPerRow;
    },
    getColor(label: ILabel): string | null {
      const { label2color } = this;
      if (label === undefined
        || label.category === undefined
        || label2color === null) return null;
      return label2color(label.category);
    },
  },
});
</script>
