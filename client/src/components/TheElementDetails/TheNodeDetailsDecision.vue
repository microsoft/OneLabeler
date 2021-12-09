<template>
  <v-card tile>
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
    </div>
    <v-divider />
    <div class="py-2 px-4">
      <!-- The data type selection. -->
      <span class="subtitle-2">
        Branching Criteria
      </span>
      <span
        class="pl-4 py-2 subtitle-2 grey--text"
        style="
          text-decoration: underline;
          text-decoration-style: dotted;
          text-underline-position: under;
        "
      >
        stop == true ?
      </span>
    </div>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { WorkflowNode } from '@/commons/types';

export default {
  name: 'TheNodeDetailsDecision',
  props: {
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Conditional Branching',
    };
  },
};
</script>
