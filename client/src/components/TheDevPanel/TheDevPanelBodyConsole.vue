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
        v-for="(message, i) in consoleMessages"
        :key="i"
        style="border-style: solid; border-width: 1px;"
        :style="{
          color: {
            'Success': '#5aaf4b',
            'Warning': '#fb8c00',
            'Error': '#f5504e',
          }[message.type],
          'background-color': {
            'Success': '#ebf6ea',
            'Warning': '#fef1e0',
            'Error': '#fdebeb',
          }[message.type],
          cursor: !isSubjectEmpty(message) ? 'pointer' : undefined,
          'margin-top': i === 0 ? 0 : '-1px',
        }"
        class="px-2 shadow"
        @click="onClickMessage(message)"
        @mouseover="onMouseoverMessage(message)"
        @mouseleave="onMouseleaveMessage"
      >
        <v-icon
          aria-hidden="true"
          :color="{
            'Success': '#5aaf4b',
            'Warning': '#fb8c00',
            'Error': '#f5504e',
          }[message.type]"
          class="pr-1"
          small
        >
          {{ {
            'Success': $vuetify.icons.values.success,
            'Warning': $vuetify.icons.values.warning,
            'Error': $vuetify.icons.values.error,
          }[message.type] }}
        </v-icon>
        {{ message.message }}
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import type { LintMessage } from '@/commons/workflow-utils/lint-workflow';
import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from '@/commons/types';

const isElementEdge = (element: WorkflowNode | WorkflowEdge) => 'source' in element;

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
    'hover:nodes': null,
    'hover:edges': null,
  },
  computed: {
    ...mapGetters('workflow', ['consoleMessages']),
  },
  methods: {
    onClickMessage(message: LintMessage): void {
      const { subjects } = message;
      if (subjects.length === 0) return;
      this.$emit('select:nodes', subjects.filter((d) => !isElementEdge(d)).map((d) => d.id));
      this.$emit('select:edges', subjects.filter((d) => isElementEdge(d)).map((d) => d.id));
    },
    onMouseoverMessage(message: LintMessage): void {
      const { subjects } = message;
      if (subjects.length === 0) return;
      this.$emit('hover:nodes', subjects.filter((d) => !isElementEdge(d)).map((d) => d.id));
      this.$emit('hover:edges', subjects.filter((d) => isElementEdge(d)).map((d) => d.id));
    },
    onMouseleaveMessage(): void {
      this.$emit('hover:nodes', []);
      this.$emit('hover:edges', []);
    },
    isSubjectEmpty(message: LintMessage): boolean {
      const { subjects } = message;
      return subjects === null || subjects === undefined || subjects.length === 0;
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
