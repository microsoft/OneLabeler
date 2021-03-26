<template>
  <!-- The configuration menus. -->
  <v-container class="pa-0">
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
            Workflow
          </v-card-title>
          <v-divider />
          <v-card-actions>
            <svg
              style="height: 200px; width: 100%;"
            >
              <g
                v-for="(node, i) in graph.nodes"
                :key="`node-${i}`"
                :transform="`translate(${node.x},${node.y})`"
                style="cursor: pointer"
                @click="onClickGraphNode(node)"
              >
                <rect
                  :fill="{
                    'algorithm': '#DBEEF4',
                    'interface': '#EBF1DE',
                    'data': '#FCD5B5',
                  }[node.type]"
                  :stroke="{
                    'algorithm': '#4BACC6',
                    'interface': '#9BBB59',
                    'data': '#E46C0A',
                  }[node.type]"
                  stroke-width="1px"
                  :width="rectWidth"
                  :height="rectHeight"
                />
                <text
                  :y="rectHeight / 2"
                  font-size="14px"
                  dominant-baseline="middle"
                  text-anchor="middle"
                >
                  <tspan
                    v-for="(word, j) in node.title.split(' ')"
                    :key="j"
                    :x="rectWidth / 2"
                    :dy="j === 0 ? `${-(node.title.split(' ').length - 1) * 0.6}em` : '1.2em'"
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
                :x1="graph.nodes[edge.source].x + rectWidth"
                :y1="graph.nodes[edge.source].y + rectHeight / 2"
                :x2="graph.nodes[edge.target].x"
                :y2="graph.nodes[edge.target].y + rectHeight / 2"
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
          v-if="selectedNode !== null"
          style="height: 100%"
          :title="`${selectedNode.title} Parameters`"
          :menus-config="selectedNode.config"
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
              {{ 'Component Parameters' }}
            </v-card-title>
            <v-divider />
            <v-card-actions style="height: calc(100% - 30px)">
              <p class="mx-auto subtitle-1">
                No Workflow Component Selected
              </p>
            </v-card-actions>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import {
  LabelTaskType,
  DefaultLabelingMethodType,
  SamplingStrategyType,
} from '@/commons/types';
import VMenusFlat from './VMenusFlat.vue';

enum NodeTypes {
  algorithm = 'algorithm',
  interface = 'interface',
  data = 'data',
}

type Node = {
  title: string,
  type: NodeTypes,
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

const menusConfig: {
  [key: string]: {
    title: string;
    options: unknown[];
    optionsText: string[];
  }
} = {
  samplingStrategy: {
    title: 'Sampling Strategy',
    options: [
      SamplingStrategyType.Random,
      SamplingStrategyType.ClusterCentroids,
      SamplingStrategyType.DenseAreas,
      SamplingStrategyType.Entropy,
      SamplingStrategyType.LeastConfident,
      SamplingStrategyType.SmallestMargin,
    ],
    optionsText: [
      'Random',
      'Cluster Centroids',
      'Dense Areas',
      'Entropy',
      'Least Confident',
      'Smallest Margin',
    ],
  },
  nBatch: {
    title: 'Data Objects Per Sampled Batch',
    options: [1, 4, 16, 32, 48, 64, 96],
    optionsText: ['1', '4', '16', '32', '48', '64', '96'],
  },
  defaultLabelingMethod: {
    title: 'Default Labeling Model',
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
  showDatasetOverview: {
    title: 'Show Dataset Overview',
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
  enableImageClassification: {
    title: 'Annotate Image Label',
    options: [false, true],
    optionsText: ['No', 'Yes'],
  },
  enableObjectDetection: {
    title: 'Annotate Object Polygon',
    options: [false, true],
    optionsText: ['No', 'Yes'],
  },
  enableImageSegmentation: {
    title: 'Annotate Segmentation Mask',
    options: [false, true],
    optionsText: ['No', 'Yes'],
  },
};

export default Vue.extend({
  name: 'TheNavBarViewDialogGraphView',
  components: {
    VMenusFlat,
  },
  data() {
    const rectWidth = 80;
    const rectHeight = 60;
    return {
      rectWidth,
      rectHeight,
      selectedNode: null,
      graph: {
        nodes: [
          {
            title: 'Feature Extraction',
            type: NodeTypes.algorithm,
            x: 25,
            y: 25,
            config: {},
          },
          {
            title: 'Algorithmic Sampling',
            type: NodeTypes.algorithm,
            x: 145,
            y: 25,
            config: {
              samplingStrategy: menusConfig.samplingStrategy,
              nBatch: menusConfig.nBatch,
            },
          },
          {
            title: 'User Sampling',
            type: NodeTypes.interface,
            x: 145,
            y: 115,
            config: {
              showDatasetOverview: menusConfig.showDatasetOverview,
            },
          },
          {
            title: 'Default Labeling',
            type: NodeTypes.algorithm,
            x: 265,
            y: 25,
            config: {
              defaultLabelingMethod: menusConfig.defaultLabelingMethod,
            },
          },
          {
            title: 'Sampled Object Details',
            type: NodeTypes.interface,
            x: 385,
            y: 25,
            config: {
              itemsPerRow: menusConfig.itemsPerRow,
              itemsPerCol: menusConfig.itemsPerCol,
            },
          },
          {
            title: 'Stoppage Analysis',
            type: NodeTypes.interface,
            x: 505,
            y: 25,
            config: {},
          },
          {
            title: 'Labeled Data',
            type: NodeTypes.data,
            x: 625,
            y: 25,
            config: {
              enableImageClassification: menusConfig.enableImageClassification,
              enableObjectDetection: menusConfig.enableObjectDetection,
              enableImageSegmentation: menusConfig.enableImageSegmentation,
            },
          },
        ],
        edges: [
          { source: 0, target: 1 },
          { source: 1, target: 3 },
          { source: 2, target: 3 },
          { source: 3, target: 4 },
          { source: 4, target: 5 },
          { source: 5, target: 6 },
        ],
      },
    };
  },
  computed: {
    ...mapState('workflow', [
      'samplingStrategy',
      'showDatasetOverview',
      'defaultLabelingMethod',
      'nBatch',
      'itemsPerRow',
      'itemsPerCol',
      'labelTasks',
    ]),
    settings() {
      const {
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        nBatch,
        itemsPerRow,
        itemsPerCol,
        labelTasks,
      } = this;

      const enableImageClassification = labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ImageClassification,
      ) >= 0;
      const enableObjectDetection = labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ObjectDetection,
      ) >= 0;
      const enableImageSegmentation = labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ImageSegmentation,
      ) >= 0;
      return {
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        nBatch,
        itemsPerRow,
        itemsPerCol,
        enableImageClassification,
        enableObjectDetection,
        enableImageSegmentation,
      };
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setSamplingStrategy',
      'setNBatch',
      'setDefaultLabelingMethod',
      'setShowDatasetOverview',
      'setItemsPerRow',
      'setItemsPerCol',
      'setLabelTasks',
    ]),
    onClickGraphNode(node: Node) {
      this.selectedNode = node;
    },
    onClickMenuOption(menuKey: string, option: unknown): void {
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
      if (menuKey === 'itemsPerRow') {
        this.setItemsPerRow(option as number);
      }
      if (menuKey === 'itemsPerCol') {
        this.setItemsPerCol(option as number);
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
