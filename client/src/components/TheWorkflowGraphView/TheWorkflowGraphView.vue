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
          <v-card-actions>
            <TheWorkflowGraphViewCanvas
              :graph="graph"
              @select-node="onSelectNode"
              @remove-node="onRemoveNode"
            />
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        cols="4"
        class="pl-1"
      >
        <TheNodeParameterView
          :node="selectedNode"
          @set-node-value="onSetNodeValue"
          @edit-node="onEditNode"
          @edit-method="onEditMethod"
          @create-option="onCreateOption"
          @click-recompute="onClickRecompute"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import {
  DefaultLabelingMethodType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
  FeatureExtractionMethod,
} from '@/commons/types';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import TheNodeParameterView from './TheNodeParameterView.vue';
import { WorkflowNode, NodeTypes } from './types';

const graph = {
  nodes: [
    {
      id: 'labelTask-47353599',
      title: 'label task',
      type: NodeTypes.labelTask,
      value: [],
      x: 25,
      y: 25,
    },
    {
      id: 'featureExtraction-37008559',
      title: 'feature extraction',
      type: NodeTypes.featureExtraction,
      value: {
        name: 'SVD (Unsupervised)',
        api: 'http://localhost:8005/extractFeatures/image/SVD',
        parameters: ['dataObjects'],
        isBuiltIn: true,
        id: 'image-SVD-25940167',
      },
      x: 145,
      y: 25,
    },
    {
      id: 'dataObjectSelection-6411710',
      title: 'data object selection',
      type: NodeTypes.dataObjectSelection,
      value: {
        strategy: SamplingStrategyType.Random,
        nBatch: 1,
        api: '',
        projectionAidEnabled: false,
      },
      x: 265,
      y: 25,
    },
    {
      id: 'defaultLabeling-86803967',
      title: 'default labeling',
      type: NodeTypes.defaultLabeling,
      value: {
        method: DefaultLabelingMethodType.Null,
        api: '',
      },
      x: 385,
      y: 25,
    },
    {
      id: 'taskTransformation-63746075',
      title: 'task transform',
      type: NodeTypes.taskTransformation,
      value: {
        method: TaskTransformationType.DirectLabeling,
      },
      x: 505,
      y: 25,
    },
    {
      id: 'interactiveLabeling-44216216',
      title: 'interctive labeling',
      type: NodeTypes.interactiveLabeling,
      value: {
        singleObjectDisplayEnabled: false,
        gridMatrixEnabled: false,
        itemsPerRow: 8,
        itemsPerCol: 6,
      },
      x: 625,
      y: 25,
    },
    {
      id: 'stoppageAnalysis-70767097',
      title: 'stoppage analysis',
      type: NodeTypes.stoppageAnalysis,
      value: {
        method: StoppageAnalysisType.AllChecked,
        api: '',
      },
      x: 745,
      y: 25,
    },
    {
      id: 'decision-69466632',
      title: 'stop?',
      type: NodeTypes.decision,
      x: 745,
      y: 115,
    },
    {
      id: 'terminal',
      title: 'exit',
      type: NodeTypes.terminal,
      x: 745,
      y: 205,
    },
    {
      id: 'interimModelTraining-14283634',
      title: 'interim model training',
      type: NodeTypes.interimModelTraining,
      value: {
        enabled: false,
        method: InterimModelTrainingType.Retrain,
      },
      x: 265,
      y: 115,
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
    TheWorkflowGraphViewCanvas,
    TheNodeParameterView,
  },
  data() {
    return {
      graph,
      selectedNode: null as null | WorkflowNode,
    };
  },
  computed: {
    ...mapState('workflow', ['featureExtractionMethods']),
  },
  methods: {
    ...mapActions('workflow', [
      'setFeatureExtractionMethods',
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
      'extractFeatures',
    ]),
    onSelectNode(node: WorkflowNode) {
      this.selectedNode = node;
    },
    onRemoveNode(node: WorkflowNode) {
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
    onEditNode(newValue: WorkflowNode) {
      const newGraph = { ...this.graph };
      const idx = newGraph.nodes.findIndex((d) => d.id === newValue.id);
      newGraph.nodes[idx] = newValue;
      this.graph = newGraph;
      if (newValue.type === NodeTypes.featureExtraction) {
        this.setFeatureExtractionMethod(newValue.value);
      }
      this.selectedNode = newValue;
    },
    onEditMethod(newValue: FeatureExtractionMethod) {
      const { featureExtractionMethods } = this;
      const idx = featureExtractionMethods.findIndex((d) => d.id === newValue.id);
      const newFeatureExtractionMethods = [...featureExtractionMethods];
      newFeatureExtractionMethods[idx] = newValue;
      this.setFeatureExtractionMethods(newFeatureExtractionMethods);
    },
    onSetNodeValue(node: WorkflowNode, value: unknown) {
      const newGraph = { ...this.graph };
      const idx = newGraph.nodes.findIndex((d) => d.id === node.id);
      newGraph.nodes[idx].value = value;
      this.graph = newGraph;

      if (node.type === NodeTypes.labelTask) {
        this.setLabelTasks(value);
      }
      if (node.type === NodeTypes.featureExtraction) {
        this.setFeatureExtractionMethod(value);
      }
      if (node.type === NodeTypes.dataObjectSelection) {
        const {
          strategy,
          nBatch,
          projectionAidEnabled,
        } = value;
        this.setSamplingStrategy(strategy);
        this.setNBatch(nBatch);
        this.setShowDatasetOverview(projectionAidEnabled);
      }
      if (node.type === NodeTypes.defaultLabeling) {
        const { method } = value;
        this.setDefaultLabelingMethod(method);
      }
      if (node.type === NodeTypes.interactiveLabeling) {
        const {
          singleObjectDisplayEnabled,
          gridMatrixEnabled,
          itemsPerRow,
          itemsPerCol,
        } = value;
        this.setSingleObjectDisplayEnabled(singleObjectDisplayEnabled);
        this.setGridMatrixEnabled(gridMatrixEnabled);
        this.setItemsPerRow(itemsPerRow);
        this.setItemsPerCol(itemsPerCol);
      }
      if (node.type === NodeTypes.interimModelTraining) {
        const { enabled } = value;
        this.setInterimModelTrainingEnabled(enabled);
      }
    },
    onCreateOption(nodeType: NodeTypes) {
      if (nodeType === NodeTypes.featureExtraction) {
        const { featureExtractionMethods } = this;
        const method = {
          name: 'custom',
          api: '',
          parameters: ['dataObjects'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setFeatureExtractionMethods([
          ...featureExtractionMethods,
          method,
        ]);
      }
    },
    onClickRecompute(node: WorkflowNode) {
      if (node.type === NodeTypes.featureExtraction) {
        this.extractFeatures(node.value);
      }
    },
  },
});
</script>
