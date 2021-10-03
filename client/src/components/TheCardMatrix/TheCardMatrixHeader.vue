<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
  >
    <template #title>
      <VDataTypeIcon :data-type="dataType" />
      Sampled Objects
    </template>
    <template #tools>
      <div
        v-for="(setup, i) in taskSetups"
        :key="i"
        style="display: flex"
      >
        <v-divider
          class="mx-1"
          vertical
        />
        <component
          :is="setup.batchTool"
          :categories="filterClassesByLabelTask(setup.type)"
          :unlabeled-mark="unlabeledMark"
          :label2color="label2color"
          @upsert-bulk:label="$emit('upsert-bulk:label', $event)"
        />
      </div>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  DataType,
  LabelTaskType,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default Vue.extend({
  name: 'TheCardMatrixHeader',
  components: { VDataTypeIcon, VToolbar },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
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
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.batchTool !== undefined);
    },
  },
  methods: {
    filterClassesByLabelTask(labelTask: LabelTaskType): Category[] {
      const { categoryTasks } = this;
      const classesFiltered: Category[] = Object.entries(categoryTasks)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([category, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
      return classesFiltered;
    },
  },
});
</script>
