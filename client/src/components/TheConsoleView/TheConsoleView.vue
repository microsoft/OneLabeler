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
      <VMessage
        v-for="(message, i) in consoleMessages"
        :key="getMsgId(message)"
        :message="message"
        :style="{ 'margin-top': i === 0 ? 0 : '-1px' }"
        style="border-style: solid; border-width: 1px;"
        @click.native="onClickMessage(message)"
        @mouseover.native="onMouseoverMessage(message)"
        @mouseleave.native="onMouseleaveMessage"
      />
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import type { LintMessage } from '@/commons/workflow-utils/lint-workflow';
import type { WorkflowEdge, WorkflowGraph, WorkflowNode } from '@/commons/types';
import VMessage from './VMessage.vue';

const isElementEdge = (element: WorkflowNode | WorkflowEdge) => 'source' in element;
const filterNodeIds = (elements: (WorkflowNode | WorkflowEdge)[]) => (
  elements.filter((d) => !isElementEdge(d)).map((d) => d.id)
);
const filterEdgeIds = (elements: (WorkflowNode | WorkflowEdge)[]) => (
  elements.filter((d) => isElementEdge(d)).map((d) => d.id)
);
const getMsgId = (message: LintMessage): string => (
  `${message.message}-${message.subjects?.map((d) => d.id) ?? ''}`
);

export default defineComponent({
  name: 'TheConsoleView',
  components: { VMessage },
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
      if (subjects === undefined || subjects.length === 0) return;
      this.$emit('select:nodes', filterNodeIds(subjects));
      this.$emit('select:edges', filterEdgeIds(subjects));
    },
    onMouseoverMessage(message: LintMessage): void {
      const { subjects } = message;
      if (subjects === undefined || subjects.length === 0) return;
      this.$emit('hover:nodes', filterNodeIds(subjects));
      this.$emit('hover:edges', filterEdgeIds(subjects));
    },
    onMouseleaveMessage(): void {
      this.$emit('hover:nodes', []);
      this.$emit('hover:edges', []);
    },
    getMsgId,
  },
});
</script>

<style scoped>
.shadow:hover {
  -moz-box-shadow: inset 0px 0px 5px #aaa;
  -webkit-box-shadow: inset 0px 0px 5px #aaa;
  box-shadow: inset 0px 0px 5px #aaa;
}

.tree-node-arrow {
  color: #6e6e6e;
  display: inline-block;
  font-size: 12px;
  margin-right: 3px;
}

.tree-node-arrow-expanded {
  transform: rotate(90deg);
}

.tree-node-arrow-collapsed {
  transform: rotate(0deg);
}
</style>
