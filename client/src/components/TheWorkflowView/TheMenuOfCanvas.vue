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
        class="py-0 px-1"
        style="min-height: 24px; user-select: none;"
      >
        Create Node
      </v-list-item>
      <v-divider />
      <v-list-item
        v-for="(option, i) in menuOptions"
        :key="i"
        class="py-0 px-1"
        style="min-height: 24px"
        @click="$emit('click:option', option.value)"
      >
        <div
          style="width: 15px; height: 15px; margin-right: 4px;"
          :style="{ 'background-color': nodeTypeToColor(option.value) }"
        />
        {{ option.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { WorkflowNodeType } from '@/commons/types';
import { nodeTypeToColor } from '@/commons/utils';

const menuOptions = [
  {
    label: 'initialization',
    value: WorkflowNodeType.Initialization,
  },
  {
    label: 'feature extraction',
    value: WorkflowNodeType.FeatureExtraction,
  },
  {
    label: 'data object selection',
    value: WorkflowNodeType.DataObjectSelection,
  },
  {
    label: 'default labeling',
    value: WorkflowNodeType.DefaultLabeling,
  },
  {
    label: 'interactive labeling',
    value: WorkflowNodeType.InteractiveLabeling,
  },
  {
    label: 'stoppage analysis',
    value: WorkflowNodeType.StoppageAnalysis,
  },
  {
    label: 'model training',
    value: WorkflowNodeType.ModelTraining,
  },
  {
    label: 'custom',
    value: WorkflowNodeType.Custom,
  },
  {
    label: 'decision',
    value: WorkflowNodeType.Decision,
  },
  {
    label: 'exit',
    value: WorkflowNodeType.Exit,
  },
];

export default defineComponent({
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
  emits: {
    'update:show': null,
    'click:option': null,
  },
  data() {
    return { menuOptions };
  },
  methods: { nodeTypeToColor },
});
</script>
