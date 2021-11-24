<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
  >
    <template #title>
      <VDataTypeIcon :data-type="dataType" />
      Sampled Object
    </template>
    <template #tools>
      <!-- The toolbars for each label task. -->
      <template v-for="(setup, i) in taskSetups">
        <v-divider
          :key="`${i}-divider`"
          class="mx-1"
          vertical
        />
        <component
          :is="setup.singleTool"
          :key="`${i}-tool`"
          :label="label"
          :categories="filterCategoriesByLabelTask(setup.type)"
          :label2color="label2color"
          :disabled="label === null"
          @upsert:label="$emit('upsert:label', $event)"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type {
  Category,
  DataType,
  ILabel,
  LabelTaskType,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';

export default {
  name: 'TheTimeSpanBoardHeader',
  components: { VDataTypeIcon, VToolbar },
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
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.singleTool !== undefined);
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
};
</script>
