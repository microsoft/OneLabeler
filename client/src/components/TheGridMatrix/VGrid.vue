<template>
  <v-card
    :style="{
      'box-shadow': isSelected ? '0px 0px 0px 3px #757575 !important' : undefined,
      'opacity': isLabeled ? '0.5' : undefined,
      display: 'flex',
      'flex-direction': 'column',
    }"
    :ripple="false"
    @click="$emit('click:grid', $event)"
    @mouseenter="$emit('hover:grid')"
    @mouseleave="$emit('leave:grid')"
  >
    <!-- set pointer events none so that
      hover the child will not trigger mouse out of the parent -->
    <VGridHeader
      class="px-1 py-0 white--text"
      pointer-events="none"
      :label-tasks="labelTasks"
      :label="label"
      :status="status"
      :category-tasks="categoryTasks"
      :label2color="label2color"
      :title="title"
      :style="{ 'height': `${headerHeight}px` }"
      @upsert:label="$emit('upsert:label', $event)"
    />
    <component
      :is="component"
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
      style="flex: 1 1 auto"
    />
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
import VGridHeader from './VGridHeader.vue';

export default Vue.extend({
  name: 'VGrid',
  components: { VGridHeader },
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
    isLabeled(): boolean {
      return this.status === StatusType.Labeled;
    },
  },
});
</script>
