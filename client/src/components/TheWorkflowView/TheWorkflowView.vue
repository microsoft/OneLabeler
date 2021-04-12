<template>
  <!-- The configuration menus. -->
  <v-container
    class="pa-0"
    style="max-width: 1400px"
  >
    <v-row no-gutters>
      <v-col
        cols="8"
        class="pr-1"
      >
        <v-card
          tile
        >
          <v-card-title
            class="view-header"
          >
            <v-icon
              class="px-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.flowChart
            </v-icon>
            Workflow Graph
          </v-card-title>
          <v-divider />
          <v-card-actions
            style=""
          >
            <svg
              style="height: 290px; width: 100%;"
            >
              <g
                v-for="(node, i) in graph.nodes"
                :key="`node-${i}`"
                :transform="`translate(${node.x},${node.y})`"
                :style="{
                  cursor: (node.category === 'process') || (node.category === 'data')
                    ? 'pointer' : undefined
                }"
                @click="(node.category === 'process') || (node.category === 'data')
                  ? onClickGraphNode(node) : undefined"
              >
                <template v-if="(node.category === 'process') || (node.category === 'data')">
                  <rect
                    fill-opacity="0"
                    stroke="black"
                    stroke-width="1px"
                    :width="rectWidth"
                    :height="rectHeight"
                    :style="{
                      'stroke-dasharray': !enabled(node) ? '5 5' : undefined
                    }"
                    @contextmenu="node.category === 'process'
                      ? onRightClickNode($event, node) : undefined"
                  />
                  <rect
                    :fill="{
                      'process': '#8C564B',
                      'data': '#FF7F0E',
                    }[node.category]"
                    stroke-width="1px"
                    :width="rectWidth"
                    :height="5"
                    style="pointer-events: none"
                  />
                </template>
                <template v-else-if="node.category === 'decision'">
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
                    :dy="j === 0 ? `${-(node.title.split(' ').length - 1) * 0.6}em` : '1.2em'"
                    :fill="enabled(node) ? '#000' : '#AAA'"
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
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        class="pl-1"
      >
        <VMenusFlat
          v-if="(selectedNode !== null) && (selectedNode.tree === undefined)"
          style="height: 100%"
          :title="selectedNode.title + ' '
            + (selectedNode.category === 'process' ? 'Instantiation' : 'Setting')"
          :menus-config="selectedNode.config"
          :selected-options="settings"
          @click-menu-option="onClickMenuOption"
        />
        <VMenusGrouped
          v-else-if="(selectedNode !== null) && (selectedNode.tree !== undefined)"
          style="height: 100%"
          :title="selectedNode.title + ' '
            + (selectedNode.category === 'process' ? 'Instantiation' : 'Setting')"
          :menus-config="selectedNode.config"
          :menu-tree="selectedNode.tree"
          :selected-options="settings"
          @click-menu-option="onClickMenuOption"
        />
        <template v-else>
          <v-card
            tile
            style="height: 100%"
          >
            <v-card-title
              class="view-header"
            >
              <v-icon
                class="px-2"
                aria-hidden="true"
                small
              >
                $vuetify.icons.values.parameter
              </v-icon>
              {{ 'Element Setting' }}
            </v-card-title>
            <v-divider />
            <v-card-actions style="height: calc(100% - 30px)">
              <p class="mx-auto subtitle-1">
                No Workflow Element Selected
              </p>
            </v-card-actions>
          </v-card>
        </template>
      </v-col>
    </v-row>
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
          :disabled="rightClickedNode !== null ? !nodeDeleteSupported(rightClickedNode) : true"
          @click="onClickContextMenuRemove"
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
import { mapActions, mapState } from 'vuex';
import {
  LabelTaskType,
  FeatureExtractionMethodType,
  DefaultLabelingMethodType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
} from '@/commons/types';
import VMenusFlat from './VMenusFlat.vue';
import VMenusGrouped from './VMenusGrouped.vue';

enum NodeCategories {
  data = 'data',
  process = 'process',
  decision = 'decision',
  terminal = 'terminal',
}

enum NodeTypes {
  featureExtraction = 'featureExtraction',
  dataObjectSelection = 'dataObjectSelection',
  defaultLabeling = 'defaultLabeling',
  taskTransformation = 'taskTransformation',
  interactiveLabeling = 'interactiveLabeling',
  stoppageAnalysis = 'stoppageAnalysis',
  interimModelTraining = 'interimModelTraining',
}

type Node = {
  title: string,
  category: NodeCategories,
  type?: NodeTypes,
  x: number,
  y: number,
  config: {
    [key: string]: {
      title: string;
      options: unknown[];
      optionsText: string[];
    }
  };
}

const menus = {
  labelTask: {
    enableClassification: {
      title: 'Classification',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
    enableObjectDetection: {
      title: 'Object Detection',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
    enableSegmentation: {
      title: 'Segmentation',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
  },
  featureExtraction: {
    featureExtractionMethod: {
      title: 'Method',
      options: [
        FeatureExtractionMethodType.Handcrafted,
        FeatureExtractionMethodType.Unsupervised,
      ],
      optionsText: [
        'Handcrafted',
        'Unsupervised',
      ],
    },
  },
  dataObjectSelection: {
    samplingStrategy: {
      title: 'Strategy',
      options: [
        SamplingStrategyType.Random,
        SamplingStrategyType.Cluster,
        SamplingStrategyType.DenseAreas,
        SamplingStrategyType.ClusterCentroids,
        SamplingStrategyType.Entropy,
        SamplingStrategyType.LeastConfident,
        SamplingStrategyType.SmallestMargin,
      ],
      optionsText: [
        'Random',
        'Cluster',
        'Dense Areas',
        'Cluster Centroids',
        'Entropy',
        'Least Confident',
        'Smallest Margin',
      ],
    },
    nBatch: {
      title: 'Selection Batch Size',
      options: [1, 4, 16, 32, 48, 64, 96],
      optionsText: ['1', '4', '16', '32', '48', '64', '96'],
    },
    showDatasetOverview: {
      title: 'Projection Support Enabled',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
  },
  defaultLabeling: {
    defaultLabelingMethod: {
      title: 'Labeling Model',
      options: [
        DefaultLabelingMethodType.Null,
        DefaultLabelingMethodType.Random,
        DefaultLabelingMethodType.DecisionTree,
        DefaultLabelingMethodType.SVM,
        DefaultLabelingMethodType.LogisticRegression,
        DefaultLabelingMethodType.LabelSpreading,
        DefaultLabelingMethodType.RestrictedBoltzmannMachine,
      ],
      optionsText: [
        'Null',
        'Random',
        'Decision Tree',
        'SVM',
        'Logistic Regression',
        'Label Spreading',
        'Restricted Boltzmann Machine',
      ],
    },
  },
  taskTransformation: {
    taskTransformation: {
      title: 'Task Type',
      options: [TaskTransformationType.DirectLabeling],
      optionsText: ['Direct Labeling'],
    },
  },
  interactiveLabeling: {
    singleObjectDisplayEnabled: {
      title: 'Enabled',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
    gridMatrixEnabled: {
      title: 'Enabled',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
    itemsPerRow: {
      title: 'Data Objects Per Row',
      options: [1, 4, 8, 12],
      optionsText: ['1', '4', '8', '12'],
    },
    itemsPerCol: {
      title: 'Data Objects Per Column',
      options: [1, 2, 4, 6, 8],
      optionsText: ['1', '2', '4', '6', '8'],
    },
  },
  stoppageAnalysis: {
    stoppageAnalysis: {
      title: 'Method',
      options: [StoppageAnalysisType.AllChecked],
      optionsText: ['All Checked'],
    },
  },
  interimModelTraining: {
    interimModelTrainingEnabled: {
      title: 'Enabled',
      options: [false, true],
      optionsText: ['No', 'Yes'],
    },
    interimModelTraining: {
      title: 'Method',
      options: [InterimModelTrainingType.Retrain],
      optionsText: ['Retrain'],
    },
  },
};

const graph = {
  nodes: [
    {
      title: 'Label Task',
      category: NodeCategories.data,
      x: 25,
      y: 25,
      config: menus.labelTask,
    },
    {
      title: 'Feature Extraction',
      category: NodeCategories.process,
      type: NodeTypes.featureExtraction,
      x: 145,
      y: 25,
      config: menus.featureExtraction,
    },
    {
      title: 'Data Object Selection',
      category: NodeCategories.process,
      type: NodeTypes.dataObjectSelection,
      x: 265,
      y: 25,
      config: menus.dataObjectSelection,
      tree: {
        algorithmicSampling: {
          title: 'Algorithmic Sampling',
          menuKeys: ['samplingStrategy', 'nBatch'],
        },
        userSampling: {
          title: 'User Sampling',
          menuKeys: ['showDatasetOverview'],
        },
      },
    },
    {
      title: 'Default Labeling',
      category: NodeCategories.process,
      type: NodeTypes.defaultLabeling,
      x: 385,
      y: 25,
      config: menus.defaultLabeling,
    },
    {
      title: 'Task Transform',
      category: NodeCategories.process,
      type: NodeTypes.taskTransformation,
      x: 505,
      y: 25,
      config: menus.taskTransformation,
    },
    {
      title: 'Interactive Labeling',
      category: NodeCategories.process,
      type: NodeTypes.interactiveLabeling,
      x: 625,
      y: 25,
      config: menus.interactiveLabeling,
      tree: {
        singleObjectDisplay: {
          title: 'Single Object Display',
          menuKeys: ['singleObjectDisplayEnabled'],
        },
        gridMatrix: {
          title: 'GridMatrix',
          menuKeys: ['gridMatrixEnabled', 'itemsPerRow', 'itemsPerCol'],
        },
      },
    },
    {
      title: 'Stoppage Analysis',
      category: NodeCategories.process,
      type: NodeTypes.stoppageAnalysis,
      x: 745,
      y: 25,
      config: menus.stoppageAnalysis,
    },
    {
      title: 'Stop?',
      category: NodeCategories.decision,
      x: 745,
      y: 115,
      config: {},
    },
    {
      title: 'Exit',
      category: NodeCategories.terminal,
      x: 745,
      y: 205,
      config: {},
    },
    {
      title: 'Interim Model Training',
      category: NodeCategories.process,
      type: NodeTypes.interimModelTraining,
      x: 265,
      y: 115,
      config: menus.interimModelTraining,
    },
  ],
  edges: [
    {
      source: 1, target: 2, x1: 225, y1: 55, x2: 265, y2: 55,
    },
    {
      source: 2, target: 4, x1: 345, y1: 55, x2: 385, y2: 55,
    },
    {
      source: 4, target: 5, x1: 465, y1: 55, x2: 505, y2: 55,
    },
    {
      source: 5, target: 6, x1: 585, y1: 55, x2: 625, y2: 55,
    },
    {
      source: 7, target: 8, x1: 705, y1: 55, x2: 745, y2: 55,
    },
    {
      source: 6, target: 7, x1: 785, y1: 85, x2: 785, y2: 115,
    },
    {
      source: 8, target: 9, x1: 745, y1: 145, x2: 345, y2: 145,
    },
    {
      source: 6, target: 7, x1: 785, y1: 175, x2: 785, y2: 205,
    },
    {
      source: 9, target: 2, x1: 305, y1: 115, x2: 305, y2: 85,
    },
  ],
};

export default Vue.extend({
  name: 'TheNavBarViewDialogGraphView',
  components: {
    VMenusFlat,
    VMenusGrouped,
  },
  data() {
    return {
      rectWidth: 80,
      rectHeight: 60,
      graph,
      selectedNode: null,
      showMenu: false,
      rightClickX: null,
      rightClickY: null,
      rightClickedNode: null,
    };
  },
  computed: {
    ...mapState('workflow', [
      'featureExtractionMethod',
      'samplingStrategy',
      'showDatasetOverview',
      'defaultLabelingMethod',
      'taskTransformation',
      'stoppageAnalysis',
      'interimModelTraining',
      'nBatch',
      'singleObjectDisplayEnabled',
      'gridMatrixEnabled',
      'itemsPerRow',
      'itemsPerCol',
      'interimModelTrainingEnabled',
      'labelTasks',
    ]),
    settings() {
      const {
        featureExtractionMethod,
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        taskTransformation,
        stoppageAnalysis,
        interimModelTraining,
        interimModelTrainingEnabled,
        nBatch,
        singleObjectDisplayEnabled,
        gridMatrixEnabled,
        itemsPerRow,
        itemsPerCol,
        labelTasks,
      } = this;

      const enableClassification = labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ImageClassification,
      ) >= 0;
      const enableObjectDetection = labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ObjectDetection,
      ) >= 0;
      const enableSegmentation = labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ImageSegmentation,
      ) >= 0;
      return {
        featureExtractionMethod,
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        taskTransformation,
        stoppageAnalysis,
        interimModelTraining,
        interimModelTrainingEnabled,
        nBatch,
        singleObjectDisplayEnabled,
        gridMatrixEnabled,
        itemsPerRow,
        itemsPerCol,
        enableClassification,
        enableObjectDetection,
        enableSegmentation,
      };
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setFeatureExtractionMethod',
      'setSamplingStrategy',
      'setNBatch',
      'setDefaultLabelingMethod',
      'setShowDatasetOverview',
      'setSingleObjectDisplayEnabled',
      'setGridMatrixEnabled',
      'setItemsPerRow',
      'setItemsPerCol',
      'setInterimModelTrainingEnabled',
      'setLabelTasks',
    ]),
    enabled(node: Node): boolean {
      if (node.type === NodeTypes.dataObjectSelection) {
        return (this.samplingStrategy !== SamplingStrategyType.Random)
          || this.showDatasetOverview
          || (this.nBatch !== 1);
      }
      if (node.type === NodeTypes.defaultLabeling) {
        return this.defaultLabelingMethod !== DefaultLabelingMethodType.Null;
      }
      if (node.type === NodeTypes.interactiveLabeling) {
        return (this.singleObjectDisplayEnabled !== false)
         || (this.gridMatrixEnabled !== false);
      }
      if (node.type === NodeTypes.interimModelTraining) {
        return this.interimModelTrainingEnabled !== false;
      }
      return true;
    },
    nodeDeleteSupported(node: Node): boolean {
      return (node.type === NodeTypes.dataObjectSelection)
        || (node.type === NodeTypes.defaultLabeling)
        || (node.type === NodeTypes.interactiveLabeling)
        || (node.type === NodeTypes.interimModelTraining);
    },
    onClickGraphNode(node: Node) {
      this.selectedNode = node;
    },
    onRightClickNode(e: MouseEvent, node: Node) {
      e.preventDefault();
      this.showMenu = true;
      this.rightClickX = e.clientX;
      this.rightClickY = e.clientY;
      this.rightClickedNode = node;
    },
    onClickContextMenuRemove() {
      const node = this.rightClickedNode;
      if (node.type === NodeTypes.dataObjectSelection) {
        this.setSamplingStrategy(SamplingStrategyType.Random);
        this.setShowDatasetOverview(false);
        this.setNBatch(1);
      }
      if (node.type === NodeTypes.defaultLabeling) {
        this.setDefaultLabelingMethod(DefaultLabelingMethodType.Null);
      }
      if (node.type === NodeTypes.interactiveLabeling) {
        this.setSingleObjectDisplayEnabled(false);
        this.setGridMatrixEnabled(false);
      }
      if (node.type === NodeTypes.interimModelTraining) {
        this.setInterimModelTrainingEnabled(false);
      }
    },
    onClickMenuOption(menuKey: string, option: unknown): void {
      if (menuKey === 'featureExtractionMethod') {
        this.setFeatureExtractionMethod(option as FeatureExtractionMethodType);
      }
      if (menuKey === 'samplingStrategy') {
        this.setSamplingStrategy(option as SamplingStrategyType);
      }
      if (menuKey === 'nBatch') {
        this.setNBatch(option as number);
      }
      if (menuKey === 'defaultLabelingMethod') {
        this.setDefaultLabelingMethod(option as DefaultLabelingMethodType);
      }
      if (menuKey === 'showDatasetOverview') {
        this.setShowDatasetOverview(option as boolean);
      }
      if (menuKey === 'singleObjectDisplayEnabled') {
        this.setSingleObjectDisplayEnabled(option as boolean);
      }
      if (menuKey === 'gridMatrixEnabled') {
        this.setGridMatrixEnabled(option as boolean);
      }
      if (menuKey === 'itemsPerRow') {
        this.setItemsPerRow(option as number);
      }
      if (menuKey === 'itemsPerCol') {
        this.setItemsPerCol(option as number);
      }
      if (menuKey === 'interimModelTrainingEnabled') {
        this.setInterimModelTrainingEnabled(option as boolean);
      }
      if (menuKey === 'enableImageClassification') {
        let labelTasksUpdated = [...this.labelTasks];
        const idx = labelTasksUpdated.findIndex((d) => d === LabelTaskType.ImageClassification);
        if (option === true && !(idx >= 0)) {
          labelTasksUpdated = [...labelTasksUpdated, LabelTaskType.ImageClassification];
        } else if (option === false && idx >= 0) {
          labelTasksUpdated.splice(idx, 1);
        }
        this.setLabelTasks(labelTasksUpdated);
      }
      if (menuKey === 'enableObjectDetection') {
        let labelTasksUpdated = [...this.labelTasks];
        const idx = labelTasksUpdated.findIndex((d) => d === LabelTaskType.ObjectDetection);
        if (option === true && !(idx >= 0)) {
          labelTasksUpdated = [...labelTasksUpdated, LabelTaskType.ObjectDetection];
        } else if (option === false && idx >= 0) {
          labelTasksUpdated.splice(idx, 1);
        }
        this.setLabelTasks(labelTasksUpdated);
      }
      if (menuKey === 'enableImageSegmentation') {
        let labelTasksUpdated = [...this.labelTasks];
        const idx = labelTasksUpdated.findIndex((d) => d === LabelTaskType.ImageSegmentation);
        if (option === true && !(idx >= 0)) {
          labelTasksUpdated = [...labelTasksUpdated, LabelTaskType.ImageSegmentation];
        } else if (option === false && idx >= 0) {
          labelTasksUpdated.splice(idx, 1);
        }
        this.setLabelTasks(labelTasksUpdated);
      }
    },
  },
});
</script>
