<template>
  <g @contextmenu.stop="$emit('contextmenu:node', node, $event)">
    <!-- Highlight the nodes that have linting errors -->
    <g transform="translate(-5,-5)">
      <rect
        v-if="relevantConsoleMessages.length !== 0"
        :width="node.width + 10"
        :height="node.height + 10"
        fill="none"
        stroke="#f5504e"
        stroke-width="2"
        stroke-dasharray="2, 2"
      />
    </g>
    <template v-if="isInitialization || isProcess">
      <VNodeProcess
        :node="node"
        :is-executing="isExecuting"
        :is-selected="isSelected"
      />
    </template>
    <template v-else>
      <template v-if="isDecision">
        <polygon
          :points="`
            ${node.width / 2},0
            ${node.width},${node.height / 2}
            ${node.width / 2},${node.height}
            0,${node.height / 2}`"
          :stroke="isSelected ? 'black' : '#bbb'"
          fill="white"
          stroke-width="1"
        />
      </template>
      <template v-else-if="isExit">
        <circle
          :r="node.height / 2"
          :cx="node.width / 2"
          :cy="node.height / 2"
          :stroke="isSelected ? 'black': '#bbb'"
          fill="white"
          stroke-width="1"
        />
      </template>

      <!-- The text label of the node. -->
      <text
        :y="node.height / 2"
        font-size="14px"
        dominant-baseline="middle"
        text-anchor="middle"
        style="user-select: none; pointer-events: none;"
      >
        <tspan
          v-for="(d, i) in node.label.split(' ')"
          :key="i"
          :x="node.width / 2"
          :dy="i === 0
            ? `${-(node.label.split(' ').length - 1) * 0.6}em`
            : '1.2em'
          "
        >
          {{ d }}
        </tspan>
      </text>
    </template>

    <!-- A spinner denoting the module is currently executing. -->
    <g
      v-if="isExecuting"
      :transform="`translate(
      ${node.width > node.height ? (node.width - node.height) / 2 : 0},
      ${node.height > node.width ? (node.height - node.width) / 2 : 0})`"
    >
      <IconAnimatedSpinner
        :width="Math.min(node.width, node.height)"
        :height="Math.min(node.width, node.height)"
        color="#93BFEC"
      />
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import { WorkflowNodeType } from '@/commons/types';
import type { WorkflowNode } from '@/commons/types';
import type { LintMessage } from '@/commons/workflow-utils/lint-workflow';
import { isNodeProcess } from '@/commons/utils';
import IconAnimatedSpinner from '@/plugins/icons/IconAnimatedSpinner.vue';
import type { FlowchartNode } from '../VFlowchart/types';
import VNodeProcess from './VNodeProcess.vue';

export default defineComponent({
  name: 'VNode',
  components: { VNodeProcess, IconAnimatedSpinner },
  props: {
    node: {
      type: Object as PropType<WorkflowNode & FlowchartNode>,
      default: null,
    },
    /** Whether the node is currently executed. */
    isExecuting: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    /** Whether the node is selected in the interface. */
    isSelected: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'contextmenu:node': null,
  },
  computed: {
    ...mapGetters('workflow', ['consoleMessages']),
    relevantConsoleMessages(): LintMessage[] {
      const consoleMessages = this.consoleMessages as LintMessage[];
      return consoleMessages.filter(
        (d) => d.subjects.map((s) => s.id).includes(this.node.id),
      );
    },
    isDecision(): boolean {
      return this.node.type === WorkflowNodeType.Decision;
    },
    isExit(): boolean {
      return this.node.type === WorkflowNodeType.Exit;
    },
    isInitialization(): boolean {
      return this.node.type === WorkflowNodeType.Initialization;
    },
    isProcess(): boolean {
      return isNodeProcess(this.node);
    },
  },
});
</script>
