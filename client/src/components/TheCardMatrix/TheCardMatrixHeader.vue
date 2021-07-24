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
      <template v-if="includesClassification">
        <!-- The data object label menu. -->
        <VCategoryBatchTool
          :classes="filterClassesByLabelTask(LabelTaskType.Classification)"
          :unlabeled-mark="unlabeledMark"
          :label2color="label2color"
          @set:category="$emit('set:label-batch-category', $event)"
        />
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  DataType,
  LabelTaskType,
} from '@/commons/types';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import VCategoryBatchTool from '@/components/VLabelCategory/VBatchTool.vue';

export default Vue.extend({
  name: 'TheCardMatrixHeader',
  components: {
    VDataTypeIcon,
    VToolbar,
    VCategoryBatchTool,
  },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      default: () => [],
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
  data() {
    return { DataType, LabelTaskType };
  },
  computed: {
    includesClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.Classification);
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
