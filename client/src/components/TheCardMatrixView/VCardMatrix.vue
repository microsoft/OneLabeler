<template>
  <v-container
    ref="container"
    class="pa-0"
    fluid
  >
    <v-row
      ref="labelCards"
      align-content="start"
      dense
      no-gutters
    >
      <v-col
        v-for="(dataObject, i) in dataObjectsInPage"
        :key="dataObject.uuid"
        :style="{
          'padding': `${padding}px`,
          'width': `${100/itemsPerRow}%`,
          'max-width': `${100/itemsPerRow}%`,
          'flex-basis': `${100/itemsPerRow}%`,
        }"
      >
        <VDataObjectCard
          :data-object="dataObject"
          :label="labelsInPage[i]"
          :classes="classes"
          :title="''"
          :height="Math.max(cardHeight - 2 * padding, 0)"
          :width="Math.max(cardWidth - 2 * padding, 0)"
          @click-card-label="onClickCardLabel"
        />
      </v-col>
    </v-row>
    <v-row
      v-if="enablePagination"
      dense
      no-gutters
    >
      <div
        ref="pagination"
        class="text-center"
        style="width: 100%"
      >
        <v-pagination
          v-model="page"
          :length="nPages"
          :total-visible="Math.min(5, nPages)"
        />
      </div>
    </v-row>
  </v-container>
</template>

<script lang="ts">
/**
 * The component for rendering a list of items
 * as a matrix of cells in cards.
 */

import Vue, { PropType } from 'vue';
import { IImage, Label } from '@/types';
import VDataObjectCard from './VDataObjectCard.vue';

export default Vue.extend({
  name: 'VCardMatrix',
  components: {
    VDataObjectCard,
  },
  props: {
    dataObjects: {
      type: Array as PropType<IImage[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<Label[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Label[]>,
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
    padding: {
      type: Number,
      default: 4,
    },
  },
  data() {
    return {
      page: 1,
      cardHeight: 0,
      cardWidth: 0,
      paginationHeight: 0,
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
    dataObjectsInPage(): IImage[] {
      const { dataObjects, indicesInPage } = this;
      return indicesInPage.map((i: number) => dataObjects[i]);
    },
    labelsInPage(): Label[] {
      const { labels, indicesInPage } = this;
      return indicesInPage.map((i: number) => labels[i]);
    },
  },
  watch: {
    page(val) {
      this.$emit('click-page', val, this.dataObjectsInPage);
    },
  },
  mounted() {
    this.updateCardSize();
  },
  updated() {
    this.updateCardSize();
  },
  methods: {
    onClickCardLabel(dataObject: IImage, label: Label) {
      this.$emit('click-card-label', dataObject, label);
    },
    updateCardSize() {
      const {
        container,
        pagination,
        labelCards,
      } = this.$refs as {
        container: HTMLElement,
        pagination: HTMLElement,
        labelCards: HTMLElement,
      };
      const height = container.clientHeight;
      const width = container.clientWidth;
      const paginationHeight = this.enablePagination ? pagination.clientHeight : 0;
      labelCards.style.height = `${height - paginationHeight}px`;
      this.cardHeight = (height - paginationHeight) / this.itemsPerCol;
      this.cardWidth = width / this.itemsPerRow;
    },
  },
});
</script>
