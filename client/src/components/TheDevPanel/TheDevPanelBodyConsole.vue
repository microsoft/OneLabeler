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
        v-for="(notification, i) in consoleMessages"
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
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import type { LintMessage } from '@/commons/workflow-utils/lint-workflow';
import type { WorkflowGraph } from '@/commons/types';

export default defineComponent({
  name: 'TheDevPanelBodyConsole',
  props: {
    graph: {
      type: Object as PropType<WorkflowGraph>,
      default: null,
    },
  },
  emits: {
    'select:nodes': null,
    'select:edges': null,
  },
  computed: {
    ...mapGetters('workflow', ['consoleMessages']),
  },
  methods: {
    onClickMessage(notification: LintMessage): void {
      const { subjects } = notification;
      if (subjects.length === 0) return;
      if (this.isSubjectNode(notification)) {
        this.$emit('select:nodes', subjects.map((d) => d.id));
      } else {
        this.$emit('select:edges', subjects.map((d) => d.id));
      }
    },
    isSubjectNode(notification: LintMessage): boolean {
      const { subjects } = notification;
      if (subjects.length === 0) return false;
      if ('source' in subjects[0]) return false;
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
