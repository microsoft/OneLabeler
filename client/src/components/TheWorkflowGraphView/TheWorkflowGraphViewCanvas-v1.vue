<template>
  <v-container class="pa-0">
    <!--
    <svg
      style="height: 600px; width: 100%;"
      @contextmenu="onContextMenuOfCanvas($event)"
    >
    </svg>
    -->
    <VGraphCanvas
      ref="canvas"
      style="height: 600px; width: 100%;"
      @contextmenu="onContextMenuOfCanvas"
    >
      <g
        v-for="(node, i) in graph.nodes"
        :key="`node-${i}`"
        :class="nodeGClass"
        :transform="`translate(${node.x},${node.y})`"
        :style="{
          cursor: (isNodeProcess(node) || isNodeInitialization(node))
            ? 'pointer' : undefined,
          opacity: isNodeImplemented(node) ? undefined : 0.3,
        }"
        :nodeId="node.id"
        @click="(isNodeProcess(node) || isNodeInitialization(node))
          ? onClickNode(node) : undefined"
        @contextmenu.stop="onContextMenuOfNode($event, node)"
      >
        <template v-if="(isNodeProcess(node) || isNodeInitialization(node))">
          <rect
            fill-opacity="0"
            stroke="black"
            stroke-width="1"
            :width="rectWidth"
            :height="rectHeight"
            :style="{
              'stroke-dasharray': (!isNodeImplemented(node) || isNodeDummyImplemented(node))
                ? '5 5' : undefined
            }"
          />
          <rect
            :fill="isNodeProcess(node) ? '#8C564B'
              : (isNodeInitialization(node) ? '#FF7F0E' : undefined)"
            stroke-width="1"
            :width="rectWidth"
            :height="5"
            style="pointer-events: none"
          />
        </template>
        <template v-else-if="isNodeDecision(node)">
          <polygon
            :points="`
              ${rectWidth/2},0
              ${rectWidth},${rectHeight/2}
              ${rectWidth/2},${rectHeight}
              0,${rectHeight/2}`"
            fill-opacity="0"
            stroke="black"
            stroke-width="1"
          />
        </template>
        <template v-else>
          <circle
            :r="rectHeight / 2"
            :cx="rectWidth / 2"
            :cy="rectHeight / 2"
            fill-opacity="0"
            stroke="black"
            stroke-width="1"
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
            v-for="(word, j) in node.label.split(' ')"
            :key="j"
            :x="rectWidth / 2"
            :dy="j === 0
              ? `${-(node.label.split(' ').length - 1) * 0.6}em`
              : '1.2em'"
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
    </VGraphCanvas>

    <!-- The context menu for nodes. -->
    <v-menu
      v-model="showMenuOfNode"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
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

    <!-- The context menu for canvas. -->
    <v-menu
      v-model="showMenuOfCanvas"
      :position-x="rightClickClientX"
      :position-y="rightClickClientY"
      absolute
      offset-y
    >
      <v-list
        class="py-0"
        style="font-size:12px"
      >
        <v-list-item
          v-for="(option, i) in createNodeMenu"
          :key="i"
          class="py-0 px-1"
          style="min-height:24px"
          @click="onCreateNode($event, option.value)"
        >
          {{ option.label }}
        </v-list-item>
      </v-list>
    </v-menu>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import * as d3 from 'd3';
import { v4 as uuidv4 } from 'uuid';
import {
  Process,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import VGraphCanvas from './VGraphCanvas.vue';

const createNodeMenu = [
  {
    label: 'create initialization node',
    value: WorkflowNodeType.Initialization,
  },
  {
    label: 'create feature extraction node',
    value: WorkflowNodeType.FeatureExtraction,
  },
  {
    label: 'create data object selection node',
    value: WorkflowNodeType.DataObjectSelection,
  },
  {
    label: 'create default labeling node',
    value: WorkflowNodeType.DefaultLabeling,
  },
  {
    label: 'create task transformation node',
    value: WorkflowNodeType.TaskTransformation,
  },
  {
    label: 'create interactive labeling node',
    value: WorkflowNodeType.InteractiveLabeling,
  },
  {
    label: 'create stoppage analysis node',
    value: WorkflowNodeType.StoppageAnalysis,
  },
  {
    label: 'create interim model training node',
    value: WorkflowNodeType.InterimModelTraining,
  },
  {
    label: 'create decision node',
    value: WorkflowNodeType.Decision,
  },
  {
    label: 'create terminal node',
    value: WorkflowNodeType.Terminal,
  },
];

export default Vue.extend({
  name: 'TheWorkflowGraphViewCanvas',
  components: {
    VGraphCanvas,
  },
  props: {
    graph: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      nodeGClass: 'workflow-graph-node-g',
      rectWidth: 80,
      rectHeight: 60,
      showMenuOfNode: false,
      showMenuOfCanvas: false,
      rightClickClientX: null as null | number,
      rightClickClientY: null as null | number,
      rightClickCanvasX: null as null | number,
      rightClickCanvasY: null as null | number,
      rightClickedNode: null as null | WorkflowNode,
      createNodeMenu,
      bind: false,
    };
  },
  computed: {
    graphWithoutPosition() {
      console.log('recompute');
      return {
        nodes: this.graph.nodes.map((d) => (
          { ...d, x: null, y: null }
        )),
      };
    },
  },
  watch: {
    graphWithoutPosition() {
      if (this.bind) return;
      this.bindDrag();
      this.bind = true;
    },
  },
  mounted() {
    this.bindDrag();
  },
  methods: {
    bindDrag() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      const dragged = function (e: MouseEvent) {
        const nodeId = this.getAttribute('nodeId');
        const node = self.graph.nodes.find((d) => d.id === nodeId);
        self.$emit('edit:node', {
          ...node,
          x: e.x,
          y: e.y,
        });
      };
      this.$nextTick(() => {
        d3.selectAll(`.${this.nodeGClass}`)
          .call(d3.drag().on('drag', dragged));
      });
    },
    isNodeInitialization(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Initialization;
    },
    isNodeProcess(node: WorkflowNode): boolean {
      return (node.type === WorkflowNodeType.LabelIdeation)
        || (node.type === WorkflowNodeType.FeatureExtraction)
        || (node.type === WorkflowNodeType.DataObjectSelection)
        || (node.type === WorkflowNodeType.DefaultLabeling)
        || (node.type === WorkflowNodeType.TaskTransformation)
        || (node.type === WorkflowNodeType.InteractiveLabeling)
        || (node.type === WorkflowNodeType.StoppageAnalysis)
        || (node.type === WorkflowNodeType.InterimModelTraining)
        || (node.type === WorkflowNodeType.QualityAssurance);
    },
    isNodeDecision(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Decision;
    },
    isNodeTerminal(node: WorkflowNode): boolean {
      return node.type === WorkflowNodeType.Terminal;
    },
    isNodeDummifiable(node: WorkflowNode): boolean {
      return (node.type === WorkflowNodeType.DataObjectSelection)
        || (node.type === WorkflowNodeType.DefaultLabeling)
        || (node.type === WorkflowNodeType.InteractiveLabeling)
        || (node.type === WorkflowNodeType.InterimModelTraining);
    },
    isNodeImplemented(node: WorkflowNode): boolean {
      if (!this.isNodeProcess(node)) return true;
      if (node.value === undefined || node.value === null) return false;
      if (Array.isArray(node.value) && node.value.length === 0) return false;
      return true;
    },
    isNodeDummyImplemented(node: WorkflowNode): boolean {
      if (!this.isNodeProcess(node)) return false;
      if (node.value === undefined || node.value === null) return false;

      if (node.type === WorkflowNodeType.FeatureExtraction) {
        return (node.value as Process).api === 'Random3D';
      }
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        if (!Array.isArray(node.value)) return false;
        if (node.value.length === 0) return false;
        return node.value.length === 1 && node.value[0].api === 'Random';
      }
      if (node.type === WorkflowNodeType.DefaultLabeling) {
        return (node.value as Process).api === 'Null';
      }
      if (node.type === WorkflowNodeType.InteractiveLabeling) {
        return node.value === undefined
          || (node.value as Process[]).length === 0;
      }
      if (node.type === WorkflowNodeType.InterimModelTraining) {
        return (node.value as Process).api === 'Static';
      }
      return false;
    },
    onClickNode(node: WorkflowNode): void {
      this.$emit('click:node', node);
    },
    onContextMenuOfNode(e: MouseEvent, node: WorkflowNode): void {
      this.showMenuOfCanvas = false;
      e.preventDefault();
      this.showMenuOfNode = true;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
      this.rightClickedNode = node;
    },
    onContextMenuOfCanvas(
      e: MouseEvent,
      { xScaled, yScaled }: { xScaled: number, yScaled: number },
    ): void {
      this.showMenuOfNode = false;
      e.preventDefault();
      this.showMenuOfCanvas = true;
      this.rightClickClientX = e.clientX;
      this.rightClickClientY = e.clientY;
      this.rightClickCanvasX = xScaled;
      this.rightClickCanvasY = yScaled;
    },
    onRemoveNode(): void {
      const node = this.rightClickedNode;
      this.$emit('remove:node', node);
    },
    onCreateNode(e: MouseEvent, type: WorkflowNodeType) {
      const labelMapper = {
        [WorkflowNodeType.Initialization]: 'initialization',
        [WorkflowNodeType.FeatureExtraction]: 'feature extraction',
        [WorkflowNodeType.DataObjectSelection]: 'data object selection',
        [WorkflowNodeType.DefaultLabeling]: 'default labeling',
        [WorkflowNodeType.TaskTransformation]: 'task transformation',
        [WorkflowNodeType.InteractiveLabeling]: 'interactive labeling',
        [WorkflowNodeType.StoppageAnalysis]: 'stoppage analysis',
        [WorkflowNodeType.InterimModelTraining]: 'interim model training',
        [WorkflowNodeType.Decision]: 'decision',
        [WorkflowNodeType.Terminal]: 'terminal',
      } as Record<WorkflowNodeType, string>;
      const valueMapper = {
        [WorkflowNodeType.Initialization]: { dataType: null, labelTasks: [] },
        [WorkflowNodeType.FeatureExtraction]: undefined,
        [WorkflowNodeType.DataObjectSelection]: [],
        [WorkflowNodeType.DefaultLabeling]: undefined,
        [WorkflowNodeType.TaskTransformation]: undefined,
        [WorkflowNodeType.InteractiveLabeling]: [],
        [WorkflowNodeType.StoppageAnalysis]: undefined,
        [WorkflowNodeType.InterimModelTraining]: undefined,
        [WorkflowNodeType.Decision]: undefined,
        [WorkflowNodeType.Terminal]: undefined,
      } as Record<WorkflowNodeType, unknown>;
      const node = {
        id: uuidv4(),
        type,
        x: this.rightClickCanvasX,
        y: this.rightClickCanvasY,
        label: labelMapper[type],
        value: valueMapper[type],
      } as WorkflowNode;
      this.$emit('create:node', node);
    },
  },
});
</script>
