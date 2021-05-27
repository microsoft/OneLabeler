<template>
  <v-card
    class="rounded-0"
    style="display: flex; flex-direction: column"
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Console
    </div>
    <div style="overflow-y: scroll;">
      <div
        v-for="(notification, i) in notifications"
        :key="i"
        :style="{
          color: {
            'Success': '#5aaf4b',
            'Warning': '#fb8c00',
            'Error': '#f5504e',
          }[notification.type],
          'background-color': {
            'Success': '#ebf6ea',
            'Warning': '#fef1e0',
            'Error': '#fdebeb',
          }[notification.type],
          cursor: isSubjectNode(notification) ? 'pointer' : undefined,
          'border-style': 'solid',
          'border-width': '1px',
          'margin-top': i === 0 ? 0 : '-1px',
        }"
        class="px-2 shadow"
        @click="onClickMessage(notification)"
      >
        <v-icon
          aria-hidden="true"
          :color="{
            'Success': '#5aaf4b',
            'Warning': '#fb8c00',
            'Error': '#f5504e',
          }[notification.type]"
          class="pr-1"
          small
        >
          {{ {
            'Success': $vuetify.icons.values.success,
            'Warning': $vuetify.icons.values.warning,
            'Error': $vuetify.icons.values.error,
          }[notification.type] }}
        </v-icon>
        {{ notification.message }}
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Notification,
  validateWorkflow,
  validateInstantiations,
} from '@/commons/graph-validate';
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
    notifications(): Notification[] {
      const notificationsWorkflow = validateWorkflow(this.graph);
      const notificationsInstantiations = validateInstantiations(this.graph);
      const notifications = [
        ...notificationsWorkflow,
        ...notificationsInstantiations,
      ];
      if (notifications.length === 0) {
        return [{
          subject: null,
          message: '🚀 The workflow is valid',
          type: 'Success',
        }];
      }
      return notifications;
    },
  },
  methods: {
    onClickMessage(notification: Notification): void {
      const { subject } = notification;
      if (subject === null) return;
      if (this.isSubjectNode(notification)) {
        this.$emit('select:nodes', [subject.id]);
      } else {
        this.$emit('select:edges', [subject.id]);
      }
    },
    isSubjectNode(notification: Notification): boolean {
      const { subject } = notification;
      if (subject === null) return false;
      if ('source' in subject) return false;
      return true;
    },
  },
});
</script>
<style scoped>
.shadow:hover {
  -moz-box-shadow: inset 0px 0px 5px #aaa;
  -webkit-box-shadow: inset 0px 0px 5px #aaa;
  box-shadow: inset 0px 0px 5px #aaa;
}
</style>
