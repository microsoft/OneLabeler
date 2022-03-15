<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="display: flex; gap: 4px; padding: 4px;">
    <!-- The content of the data object. -->
    <component
      :is="component"
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
      style="flex: 1 1 auto"
      @upsert:labels="$emit('upsert:labels', $event)"
    >
      <template #overlay="props">
        <template v-for="(setup, i) in taskSetups">
          <component
            :is="setup.overlay"
            v-if="setup.overlay !== undefined"
            v-bind="props"
            :key="i"
            :data-object="dataObject"
            :label="label"
            :unlabeled-mark="unlabeledMark"
            :label2color="label2color"
            :toolbar-state="toolbarState"
            style="grid-area: 1 / 1 / 2 / 2;"
            @upsert:labels="$emit('upsert:labels', $event)"
            @upsert:toolbar-state="$emit('upsert:toolbar-state', $event)"
          />
        </template>
      </template>
    </component>

    <!-- The interaction panels of label tasks. -->
    <template v-for="(setup, i) in taskSetups">
      <component
        :is="setup.panel"
        v-if="setup.panel !== undefined"
        :key="i"
        :label-tasks="labelTasks"
        :label="label"
        :label2color="label2color"
        :toolbar-state="toolbarState"
        style="flex: 0 1 20%"
        @upsert:labels="$emit('upsert:labels', $event)"
        @upsert:toolbar-state="$emit('upsert:toolbar-state', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import type {
  Category,
  DataType,
  IDataObject,
  ILabel,
  ILabelTaskTypeSetup,
  LabelTaskType,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';
import type { ToolbarState } from './types';

export default defineComponent({
  name: 'TheBody',
  props: {
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
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
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
  },
  emits: {
    'upsert:labels': null,
    'upsert:toolbar-state': null,
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type));
    },
    component(): VueConstructor | null {
      const { dataType } = this;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      if (dataTypeSetup === undefined) return null;
      return dataTypeSetup.display;
    },
  },
});
</script>
