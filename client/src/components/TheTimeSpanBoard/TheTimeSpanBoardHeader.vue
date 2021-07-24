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
      <template v-if="includesClassification">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The data object label menu. -->
        <VCategorySingleTool
          :label-category="label === null ? null : label.category"
          :classes="filterClassesByLabelTask(LabelTaskType.Classification)"
          :button-color="label === null ? null : label2color(label.category)"
          :disabled="label === null"
          @set:label-category="$emit('set:label-category', $event)"
        />
      </template>

      <template v-if="includesMultiLabelClassification">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The data object label menu. -->
        <VMultiCategorySingleTool
          :classes="filterClassesByLabelTask(LabelTaskType.MultiLabelClassification)"
          :label-multi-category="label === null ? null : label.multiCategory"
          :disabled="label === null"
          @set:label-multi-category="$emit('set:label-multi-category', $event)"
        />
      </template>

      <template v-if="includesFreeformText">
        <v-divider
          class="mx-2"
          vertical
        />
        <!-- The create/edit freeform text annotation button. -->
        <VFreeformTextSingleTool
          :label-text="label === null ? null : label.text"
          :disabled="label === null"
          @set:label-text="$emit('set:label-text', $event)"
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
  ILabel,
  LabelTaskType,
} from '@/commons/types';
import VDataTypeIcon from '@/components/VDataTypeIcon/VDataTypeIcon.vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import VCategorySingleTool from '@/components/VLabelCategory/VSingleTool.vue';
import VMultiCategorySingleTool from '@/components/VLabelMultiCategory/VSingleTool.vue';
import VFreeformTextSingleTool from '@/components/VLabelFreeformText/VSingleTool.vue';

export default Vue.extend({
  name: 'TheTimeSpanBoardHeader',
  components: {
    VDataTypeIcon,
    VToolbar,
    VCategorySingleTool,
    VMultiCategorySingleTool,
    VFreeformTextSingleTool,
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
  data() {
    return { DataType, LabelTaskType };
  },
  computed: {
    includesClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.Classification);
    },
    includesMultiLabelClassification(): boolean {
      return this.labelTasks.includes(LabelTaskType.MultiLabelClassification);
    },
    includesFreeformText(): boolean {
      return this.labelTasks.includes(LabelTaskType.FreeformText);
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
