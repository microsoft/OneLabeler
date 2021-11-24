<template>
  <v-menu
    :value="show"
    :position-x="positionX"
    :position-y="positionY"
    content-class="elevation-2"
    offset-y
    @input="$emit('update:show', $event)"
  >
    <v-list
      class="py-0"
      style="font-size:12px"
    >
      <v-list-item
        v-for="(option, i) in menuOptions"
        :key="i"
        class="py-0 px-1"
        style="min-height:24px"
        @click="$emit('click:option', option.value)"
      >
        {{ option.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { WorkflowNodeType } from '@/commons/types';

const menuOptions = [
  {
    label: 'create initialization node',
    value: WorkflowNodeType.Initialization,
  },
  {
    label: 'create feature extraction node',
    value: WorkflowNodeType.FeatureExtraction,
  },
  {
    label: 'create data object selection node',
    value: WorkflowNodeType.DataObjectSelection,
  },
  {
    label: 'create default labeling node',
    value: WorkflowNodeType.DefaultLabeling,
  },
  {
    label: 'create interactive labeling node',
    value: WorkflowNodeType.InteractiveLabeling,
  },
  {
    label: 'create stoppage analysis node',
    value: WorkflowNodeType.StoppageAnalysis,
  },
  {
    label: 'create model training node',
    value: WorkflowNodeType.ModelTraining,
  },
  {
    label: 'create custom node',
    value: WorkflowNodeType.Custom,
  },
  {
    label: 'create decision node',
    value: WorkflowNodeType.Decision,
  },
  {
    label: 'create exit node',
    value: WorkflowNodeType.Exit,
  },
];

export default {
  name: 'TheMenuOfCanvas',
  props: {
    show: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    positionX: {
      type: Number as PropType<number>,
      required: true,
    },
    positionY: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  data() {
    return { menuOptions };
  },
};
</script>
