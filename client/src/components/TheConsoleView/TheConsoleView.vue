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
        :key="message.message"
        :message="message"
        :style="{ 'margin-top': i === 0 ? 0 : '-1px' }"
        style="border-style: solid; border-width: 1px;"
        @click="onClickMessage(message)"
        @mouseover="onMouseoverMessage(message)"
        @mouseleave="onMouseleaveMessage"
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
