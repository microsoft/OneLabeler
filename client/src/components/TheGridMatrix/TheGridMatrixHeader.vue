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
      <!-- The toolbars for each label task. -->
      <template v-for="(setup, i) in taskSetups">
        <v-divider
          :key="`${i}-divider`"
          class="mx-1"
          vertical
        />
        <component
          :is="setup.batchTool"
          :key="`${i}-tool`"
          :categories="filterCategories(setup.type)"
          :unlabeled-mark="unlabeledMark"
          :label2color="label2color"
          @upsert-bulk:label="$emit('upsert-bulk:label', $event)"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
} from '@vue/composition-api';
import type {
  Category,
  DataType,
  LabelTaskType,
  ILabelTaskTypeSetup,
} from '@/commons/types';
import labelTaskTypeSetups from '@/builtins/label-task-types/index';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import useFilterCategories from '@/components/composables/useCategories';

export default defineComponent({
  name: 'TheGridMatrixHeader',
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
      type: Object as PropType<Record<Category, LabelTaskType[]>>,
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
  setup(props) {
    const { categoryTasks } = toRefs(props);
    return { ...useFilterCategories(categoryTasks) };
  },
  computed: {
    taskSetups(): ILabelTaskTypeSetup[] {
      const { labelTasks } = this;
      return labelTaskTypeSetups
        .filter((d) => (labelTasks as string[]).includes(d.type))
        .filter((d) => d.batchTool !== undefined);
    },
  },
});
</script>
