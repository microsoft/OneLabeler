<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div :style="styleCardHeader">
    <v-icon
      class="px-2"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.flowChart
    </v-icon>
    Workflow
    <v-spacer />
    <div style="display: flex; flex-direction: row; gap: 8px; margin-right: 8px;">
      <div
        v-for="(entry, i) in entries"
        :key="i"
        style="display: flex; flex-direction: row; gap: 4px; align-items: center;"
      >
        <div
          style="width: 15px; height: 15px;"
          :style="{ 'background-color': entry.color }"
        />
        {{ entry.text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { nodeTypeToColor } from '@/commons/utils';
import { WorkflowNodeType } from '@/commons/types';
import { cardHeader as styleCardHeader } from '@/style';

const entries = [
  {
    color: nodeTypeToColor(WorkflowNodeType.Initialization),
    text: 'initialization',
  },
  {
    color: nodeTypeToColor(WorkflowNodeType.InteractiveLabeling),
    text: 'computation',
  },
  {
    color: nodeTypeToColor(WorkflowNodeType.Decision),
    text: 'conditional branching',
  },
  {
    color: nodeTypeToColor(WorkflowNodeType.Exit),
    text: 'exit',
  },
];

export default {
  name: 'TheWorkflowViewHeader',
  data() {
    return {
      styleCardHeader,
      entries,
    };
  },
};
</script>
