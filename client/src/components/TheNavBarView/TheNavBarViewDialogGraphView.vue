<template>
  <!-- The configuration menus. -->
  <v-container class="pa-0" style="max-width: 1400px">
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
              style="height: 290px; width: 100%;"
            >
              <g
                v-for="(node, i) in graph.nodes"
                :key="`node-${i}`"
                :transform="`translate(${node.x},${node.y})`"
                style="cursor: pointer"
                @click="node.type !== 'logic' ? onClickGraphNode(node) : undefined"
              >
                <rect
                  fill-opacity="0"
                  stroke="black"
                  stroke-width="1px"
                  :width="rectWidth"
                  :height="rectHeight"
                />
                <rect
                  v-if="node.type !== 'logic'"
                  :fill="{
                    'process': '#8C564B',
                    'data': '#FF7F0E',
                  }[node.type]"
                  stroke-width="1px"
                  :width="rectWidth"
                  :height="5"
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
  process = 'process',
  data = 'data',
  logic = 'logic',
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
    title: 'Algorithmic Sampling Strategy',
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
    title: 'Selection Batch Size',
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
    title: 'User Sampling Enabled',
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
    title: 'Classification',
    options: [false, true],
    optionsText: ['No', 'Yes'],
  },
  enableObjectDetection: {
    title: 'Object Detection',
    options: [false, true],
    optionsText: ['No', 'Yes'],
  },
  enableImageSegmentation: {
    title: 'Segmentation',
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
            title: 'Label Task',
            type: NodeTypes.data,
            x: 25,
            y: 25,
            config: {
              enableImageClassification: menusConfig.enableImageClassification,
              enableObjectDetection: menusConfig.enableObjectDetection,
              enableImageSegmentation: menusConfig.enableImageSegmentation,
            },
          },
          {
            title: 'Feature Extraction',
            type: NodeTypes.process,
            x: 145,
            y: 25,
            config: {},
          },
          {
            title: 'Data Object Selection',
            type: NodeTypes.process,
            x: 265,
            y: 25,
            config: {
              samplingStrategy: menusConfig.samplingStrategy,
              nBatch: menusConfig.nBatch,
              showDatasetOverview: menusConfig.showDatasetOverview,
            },
          },
          {
            title: 'Default Labeling',
            type: NodeTypes.process,
            x: 385,
            y: 25,
            config: {
              defaultLabelingMethod: menusConfig.defaultLabelingMethod,
            },
          },
          {
            title: 'Task Transform- ation',
            type: NodeTypes.process,
            x: 505,
            y: 25,
            config: {},
          },
          {
            title: 'Interactive Labeling',
            type: NodeTypes.process,
            x: 625,
            y: 25,
            config: {
              itemsPerRow: menusConfig.itemsPerRow,
              itemsPerCol: menusConfig.itemsPerCol,
            },
          },
          {
            title: 'Stoppage Analysis',
            type: NodeTypes.process,
            x: 745,
            y: 25,
            config: {},
          },
          {
            title: 'Stop?',
            type: NodeTypes.logic,
            x: 745,
            y: 115,
            config: {},
          },
          {
            title: 'Exit',
            type: NodeTypes.logic,
            x: 745,
            y: 205,
            config: {},
          },
          {
            title: 'Interim Model Training',
            type: NodeTypes.process,
            x: 265,
            y: 115,
            config: {
              enableImageClassification: menusConfig.enableImageClassification,
              enableObjectDetection: menusConfig.enableObjectDetection,
              enableImageSegmentation: menusConfig.enableImageSegmentation,
            },
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
