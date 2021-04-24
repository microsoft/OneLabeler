<template>
  <v-card>
    <v-card-title
      class="view-header"
    >
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Console
    </v-card-title>
    <v-card-actions class="pa-0">
      <div
        class="pa-0"
        style="width: 100%; overflow-y: scroll;"
        dense
      >
        <p
          v-for="(notification, i) in notifications"
          :key="i"
          class="pa-1 my-0"
        >
          {{  notification.message }}
        </p>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { validateWorkflow, validateInstantiations } from '@/commons/graph-validate';
import {
  WorkflowEdge,
  WorkflowNode,
} from '@/commons/types';

export default Vue.extend({
  name: 'TheWorkflowGraphViewConsole',
  props: {
    graph: {
      type: Object as PropType<{ nodes: WorkflowNode[], edges: WorkflowEdge[] }>,
      default: null,
    },
  },
  computed: {
    notifications() {
      const notificationsWorkflow = validateWorkflow(this.graph);
      const notificationsInstantiations = validateInstantiations(this.graph);
      return [
        ...notificationsWorkflow,
        ...notificationsInstantiations,
      ];
    },
  },
});
</script>
