<template>
  <component
    :is="component"
    :data-objects="dataObjects"
    :labels="labels"
    :statuses="statuses"
    :task-window="taskWindow"
    :data-type="dataType"
    :label-tasks="labelTasks"
    :category-tasks="categoryTasks"
    :unlabeled-mark="unlabeledMark"
    :label2color="label2color"
    @user-edit-label="onUserEditLabel"
    @user-edit-labels="onUserEditLabels"
    @edit-task-window="$emit('edit-task-window', $event)"
  />
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  StatusType,
  TaskWindow,
} from '@/commons/types';
import ThePaintBoard from './ThePaintBoard/ThePaintBoard.vue';
import TheTextSpanBoard from './TheTextSpanBoard/TheTextSpanBoard.vue';
import TheTimeSpanBoard from './TheTimeSpanBoard/TheTimeSpanBoard.vue';

export default Vue.extend({
  name: 'TheSingleObjectDisplay',
  props: {
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabel[]>,
      required: true,
    },
    statuses: {
      type: Array as PropType<StatusType[]>,
      required: true,
    },
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
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
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
  },
  computed: {
    component(): VueConstructor | null {
      const { dataType, labelTasks } = this;
      if (dataType === DataType.Image) return ThePaintBoard;
      if (dataType === DataType.Text) return TheTextSpanBoard;
      if (dataType === DataType.Video) return TheTimeSpanBoard;
      if (dataType === DataType.YoutubeVideo) return TheTimeSpanBoard;
      if (dataType === DataType.Audio) return TheTimeSpanBoard;
      if (labelTasks.includes(LabelTaskType.SpanClassification)) return TheTextSpanBoard;
      return TheTextSpanBoard;
    },
  },
  methods: {
    onUserEditLabel(uuid: string, newValue: Partial<ILabel>) {
      this.$emit('user-edit-label', uuid, newValue);
    },
    onUserEditLabels(uuids: string[], newValues: Partial<ILabel>[]) {
      this.$emit('user-edit-label', uuids, newValues);
    },
  },
});
</script>
