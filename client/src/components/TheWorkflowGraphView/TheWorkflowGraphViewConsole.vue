<template>
  <v-card class="rounded-0">
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
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 28px)"
    >
      <div
        class="pa-0"
        style="width: 100%; height: 100%; overflow-y: scroll;"
        dense
      >
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
            'margin-bottom': '0px',
          }"
          class="px-2 py-0 mx-0 shadow"
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
    </v-card-actions>
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
          message: '👍 The workflow is valid',
          type: 'Success',
        }];
      }
      return notifications;
    },
  },
  methods: {
    onClickMessage(notification: Notification): void {
      this.$emit('select:node', notification.subject);
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
