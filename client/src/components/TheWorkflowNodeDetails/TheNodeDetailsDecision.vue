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
    <div class="py-2 px-4">
      <!-- The data type selection. -->
      <span class="subtitle-2">
        Decision Criteria
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
import Vue, { PropType } from 'vue';
import { WorkflowNode } from '@/commons/types';

export default Vue.extend({
  name: 'TheNodeDetailsDecision',
  props: {
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Decision',
    };
  },
});
</script>
