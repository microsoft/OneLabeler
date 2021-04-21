<template>
  <v-container>
    <svg
      style="height: 600px; width: 100%;"
    >
      <g
        v-for="(node, i) in graph.nodes"
        :key="`node-${i}`"
        :transform="`translate(${node.x},${node.y})`"
        :style="{
          cursor: (isProcessNode(node) || isDataNode(node))
            ? 'pointer' : undefined
        }"
        @click="(isProcessNode(node) || isDataNode(node))
          ? onClickNode(node) : undefined"
      >
        <template v-if="(isProcessNode(node) || isDataNode(node))">
          <rect
            fill-opacity="0"
            stroke="black"
            stroke-width="1px"
            :width="rectWidth"
            :height="rectHeight"
            :style="{
              'stroke-dasharray': !isEnabledNode(node) ? '5 5' : undefined
            }"
            @contextmenu="isProcessNode(node)
              ? onRightClickNode($event, node) : undefined"
          />
          <rect
            :fill="isProcessNode(node) ? '#8C564B'
              : (isDataNode(node) ? '#FF7F0E' : undefined)"
            stroke-width="1px"
            :width="rectWidth"
            :height="5"
            style="pointer-events: none"
          />
        </template>
        <template v-else-if="isDecisionNode(node)">
          <polygon
            :points="`
              ${rectWidth/2},0
              ${rectWidth},${rectHeight/2}
              ${rectWidth/2},${rectHeight}
              0,${rectHeight/2}`"
            fill-opacity="0"
            stroke="black"
            stroke-width="1px"
          />
        </template>
        <template v-else>
          <circle
            :r="rectHeight / 2"
            :cx="rectWidth / 2"
            :cy="rectHeight / 2"
            fill-opacity="0"
            stroke="black"
            stroke-width="1px"
          />
        </template>
        <text
          :y="rectHeight / 2"
          font-size="14px"
          dominant-baseline="middle"
          text-anchor="middle"
          style="pointer-events: none"
        >
          <tspan
            v-for="(word, j) in node.title.split(' ')"
            :key="j"
            :x="rectWidth / 2"
            :dy="j === 0
              ? `${-(node.title.split(' ').length - 1) * 0.6}em`
              : '1.2em'"
            :fill="isEnabledNode(node) ? '#000' : '#AAA'"
          >
            {{ word }}
          </tspan>
        </text>
      </g>
      <defs>
        <marker
          id="arrowhead"
          viewBox="0 -5 10 10"
          refX="10"
          refY="-0.5"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path
            fill="black"
            d="M0,-5L10,0L0,5"
          />
        </marker>
      </defs>
      <line
        v-for="(edge, i) in graph.edges"
        :key="`edge-${i}`"
        stroke="black"
        fill="black"
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        marker-end="url(#arrowhead)"
      />
    </svg>
    <v-menu
      v-model="showMenu"
      :position-x="rightClickX"
      :position-y="rightClickY"
      absolute
      offset-y
    >
      <v-list
        class="py-0"
        style="font-size:12px"
      >
        <v-list-item
          class="py-0 pl-0 pr-1"
          style="min-height:24px"
          :disabled="rightClickedNode === null || !isDeletableNode(rightClickedNode)"
          @click="onRemoveNode"
        >
          <v-icon
            class="px-2"
            aria-hidden="true"
            style="font-size:12px"
            small
          >
            $vuetify.icons.values.close
          </v-icon>
          Remove Node
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { WorkflowNode, NodeTypes } from './types';

export default Vue.extend({
  name: 'TheWorkflowGraphViewCanvas',
  props: {
    graph: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      rectWidth: 80,
      rectHeight: 60,
      showMenu: false,
      rightClickX: null as null | number,
      rightClickY: null as null | number,
      rightClickedNode: null as null | WorkflowNode,
    };
  },
  computed: {
    ...mapState('workflow', [
      'taskTransformation',
      'stoppageAnalysis',
      'dataObjectSelectionMethod',
      'defaultLabelingMethod',
      'interactiveLabelingMethod',
      'interimModelTrainingMethod',
    ]),
  },
  methods: {
    isDataNode(node: WorkflowNode): boolean {
      return (node.type === NodeTypes.LabelTask)
        || (node.type === NodeTypes.DataType);
    },
    isProcessNode(node: WorkflowNode): boolean {
      return (node.type === NodeTypes.LabelIdeation)
        || (node.type === NodeTypes.FeatureExtraction)
        || (node.type === NodeTypes.DataObjectSelection)
        || (node.type === NodeTypes.DefaultLabeling)
        || (node.type === NodeTypes.TaskTransformation)
        || (node.type === NodeTypes.InteractiveLabeling)
        || (node.type === NodeTypes.StoppageAnalysis)
        || (node.type === NodeTypes.InterimModelTraining)
        || (node.type === NodeTypes.QualityAssurance);
    },
    isDecisionNode(node: WorkflowNode): boolean {
      return node.type === NodeTypes.Decision;
    },
    isTerminalNode(node: WorkflowNode): boolean {
      return node.type === NodeTypes.Terminal;
    },
    isDeletableNode(node: WorkflowNode): boolean {
      return (node.type === NodeTypes.DataObjectSelection)
        || (node.type === NodeTypes.DefaultLabeling)
        || (node.type === NodeTypes.InteractiveLabeling)
        || (node.type === NodeTypes.InterimModelTraining);
    },
    isEnabledNode(node: WorkflowNode): boolean {
      if (node.type === NodeTypes.DataObjectSelection) {
        return this.dataObjectSelectionMethod.length !== 0;
      }
      if (node.type === NodeTypes.DefaultLabeling) {
        return this.defaultLabelingMethod.api !== 'Null';
      }
      if (node.type === NodeTypes.InteractiveLabeling) {
        return this.interactiveLabelingMethod.length !== 0;
      }
      if (node.type === NodeTypes.InterimModelTraining) {
        return this.interimModelTrainingMethod.api !== 'Static';
      }
      return true;
    },
    onClickNode(node: WorkflowNode): void {
      this.$emit('click:node', node);
    },
    onRightClickNode(e: MouseEvent, node: WorkflowNode): void {
      e.preventDefault();
      this.showMenu = true;
      this.rightClickX = e.clientX;
      this.rightClickY = e.clientY;
      this.rightClickedNode = node;
    },
    onRemoveNode(): void {
      const node = this.rightClickedNode;
      this.$emit('remove:node', node);
    },
  },
});
</script>
