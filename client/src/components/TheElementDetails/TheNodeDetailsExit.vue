<template>
  <v-card
    style="width: 100%; height: 100%"
    tile
  >
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
    <div class="py-2 px-4 subtitle-2">
      The Exit Node
    </div>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { WorkflowNode } from '@/commons/types';

export default {
  name: 'TheNodeDetailsExit',
  props: {
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Exit',
    };
  },
};
</script>
