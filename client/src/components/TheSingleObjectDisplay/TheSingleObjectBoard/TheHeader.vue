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
      <!-- mouse operation mode toggle -->
      <template v-if="dataType === DataType.PointCloud">
        <v-divider
          class="mx-1"
          vertical
        />
        <TheHeaderModeToggle
          :label-tasks="labelTasks"
          :category-tasks="categoryTasks"
          :toolbar-state="toolbarState"
          @upsert:toolbar-state="$emit('upsert:toolbar-state', $event)"
        />
      </template>

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
          :toolbar-state="toolbarState"
          :disabled="label === null"
          @upsert:labels="$emit('upsert:labels', $event)"
          @upsert:toolbar-state="$emit('upsert:toolbar-state', $event)"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { DataType } from '@/commons/types';
import type {
  Category,
  ILabel,
  LabelTaskType,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';
import TheHeaderModeToggle from './TheHeaderModeToggle.vue';
import type { ToolbarState } from './types';

export default {
  name: 'TheHeader',
  components: {
    VDataTypeIcon,
    VToolbar,
    TheHeaderModeToggle,
  },
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
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    toolbarState: {
      type: Object as PropType<ToolbarState>,
      default: null,
    },
  },
  data() {
    return { DataType };
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
      return Object.entries(this.categoryTasks)
        .filter(([, usedInTasks]) => (
          usedInTasks === null || usedInTasks.includes(labelTask)
        )).map((d) => d[0]);
    },
  },
};
</script>
