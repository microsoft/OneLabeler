<template>
  <div style="display: flex; gap: 4px; padding: 4px;">
    <!-- The content of the data object. -->
    <component
      :is="component"
      :data-object="dataObject"
      :label="label"
      :label2color="label2color"
      style="flex: 1 1 auto"
      @upsert:label="$emit('upsert:label', $event)"
    >
      <template #overlay="props">
        <template v-for="(setup, i) in taskSetups">
          <component
            :is="setup.overlay"
            v-if="setup.overlay !== undefined"
            :key="i"
            :label-tasks="labelTasks"
            :label="label"
            :label2color="label2color"
            :categories="filterCategoriesByLabelTask(setup.type)"
            :unlabeled-mark="unlabeledMark"
            :toolbar-state="toolbarState"
            :on-segment3d="props.onSegment3d"
            style="grid-area: 1 / 1 / 2 / 2; z-index: 1;"
            @upsert:label="$emit('upsert:label', $event)"
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
        :categories="filterCategoriesByLabelTask(setup.type)"
        :toolbar-state="toolbarState"
        style="flex: 0 1 20%"
        @upsert:label="$emit('upsert:label', $event)"
        @upsert:toolbar-state="$emit('upsert:toolbar-state', $event)"
      />
    </template>
  </div>
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  ILabelTaskTypeSetup,
  LabelTaskType,
} from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

export default Vue.extend({
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
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
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
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },
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
  methods: {
    filterCategoriesByLabelTask(labelTask: LabelTaskType): Category[] {
      const { categoryTasks } = this;
      const categoriesFiltered: Category[] = Object.entries(categoryTasks)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([category, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return categoriesFiltered;
    },
  },
});
</script>
