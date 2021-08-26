<template>
  <v-card
    :style="{
      'box-shadow': isSelected ? '0px 0px 0px 3px #757575 !important' : undefined,
      'opacity': isLabeled ? '0.5' : undefined,
    }"
    :ripple="false"
    @click="$emit('click:card', $event)"
    @mouseenter="$emit('hover:card')"
    @mouseleave="$emit('leave:card')"
  >
    <!-- set pointer events none so that
      hover the child will not trigger mouse out of the parent -->
    <VDataObjectCardHeader
      class="px-1 py-0 white--text"
      pointer-events="none"
      :label-tasks="labelTasks"
      :label="label"
      :status="status"
      :classes="classes"
      :category-tasks="categoryTasks"
      :title="title"
      :button-color="getColor(label)"
      :style="{ 'height': `${headerHeight}px` }"
      @set:label-category="$emit('set:label-category', $event)"
      @set:label-multi-category="$emit('set:label-multi-category', $event)"
      @set:label-text="$emit('set:label-text', $event)"
    />
    <div
      pointer-events="none"
      style="display: flex; align-items: center;"
    >
      <component
        :is="component"
        :data-object="dataObject"
        :label="label"
        :label2color="label2color"
        :height="bodyHeight"
        :width="bodyWidth"
      />
    </div>
  </v-card>
</template>

<script lang="ts">
/**
 * The wrapped component for rendering an dataObject
 * as a cell in a card.
 * This component have access to the global state.
 */

import Vue, { PropType, VueConstructor } from 'vue';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import VDataObjectCardHeader from './VDataObjectCardHeader.vue';

export default Vue.extend({
  name: 'VDataObjectCard',
  components: { VDataObjectCardHeader },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataObject: {
      type: Object as PropType<IDataObject>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | undefined>,
      default: undefined,
      required: false,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    status: {
      type: String as PropType<StatusType>,
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
    title: {
      type: String,
      default: '',
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    height: {
      type: Number,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    headerHeight: {
      type: Number,
      default: 29,
    },
  },
  computed: {
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      return dataTypeSetup?.display ?? null;
    },
    bodyHeight(): number {
      return Math.max(this.height - this.headerHeight, 0);
    },
    bodyWidth(): number {
      return this.width;
    },
    isLabeled(): boolean {
      return this.status === StatusType.Labeled;
    },
  },
  methods: {
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
