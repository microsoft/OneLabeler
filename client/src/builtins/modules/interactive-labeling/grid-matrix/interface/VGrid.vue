<template>
  <v-card
    :class="{
      'selected-grid': isSelected,
      'labeled-grid': isLabeled,
    }"
    :ripple="false"
    style="display: flex; flex-direction: column;"
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
      @upsert:labels="$emit('upsert:labels', $event)"
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

import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import { StatusType } from '@/commons/types';
import type {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import VGridHeader from './VGridHeader.vue';

export default defineComponent({
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
  emits: {
    'click:grid': null,
    'hover:grid': null,
    'leave:grid': null,
    'upsert:labels': null,
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

<style scoped>
.selected-grid {
  box-shadow: 0px 0px 0px 3px #757575 !important;
}

.labeled-grid {
  opacity: 0.5;
}
</style>
