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
          @create-method="onCreateMethod"
          @edit-method="onEditMethod"
          @create-model="onCreateModel"
          @edit-model="onEditModel"
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
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
  FeatureExtractionMethod,
  ModelService,
} from '@/commons/types';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import TheNodeParameterView from './TheNodeParameterView.vue';
import { WorkflowNode, NodeTypes, DefaultLabelingNode } from './types';

const graph = {
  nodes: [
    {
      id: 'labelTask-47353599',
      title: 'label task',
      type: NodeTypes.LabelTask,
      value: [],
      x: 25,
      y: 25,
    },
    {
      id: 'featureExtraction-37008559',
      title: 'feature extraction',
      type: NodeTypes.FeatureExtraction,
      value: {
        name: 'SVD (Unsupervised)',
        serverless: false,
        api: 'http://localhost:8005/features/image/SVD',
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
      type: NodeTypes.DataObjectSelection,
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
      type: NodeTypes.DefaultLabeling,
      value: {
        method: {
          name: 'Null (Dummy)',
          serverless: true,
          api: 'Null',
          parameters: ['features'],
          isBuiltIn: true,
          id: 'Null-35514905',
        },
        model: {},
      },
      x: 385,
      y: 25,
    },
    {
      id: 'taskTransformation-63746075',
      title: 'task transform',
      type: NodeTypes.TaskTransformation,
      value: {
        method: TaskTransformationType.DirectLabeling,
      },
      x: 505,
      y: 25,
    },
    {
      id: 'interactiveLabeling-44216216',
      title: 'interctive labeling',
      type: NodeTypes.InteractiveLabeling,
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
      type: NodeTypes.StoppageAnalysis,
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
      type: NodeTypes.Decision,
      x: 745,
      y: 115,
    },
    {
      id: 'terminal',
      title: 'exit',
      type: NodeTypes.Terminal,
      x: 745,
      y: 205,
    },
    {
      id: 'interimModelTraining-14283634',
      title: 'interim model training',
      type: NodeTypes.InterimModelTraining,
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
    ...mapState('workflow', [
      'modelServices',
      'featureExtractionMethods',
      'defaultLabelingMethods',
    ]),
  },
  methods: {
    ...mapActions('workflow', [
      'setFeatureExtractionMethods',
      'setFeatureExtractionMethod',
      'setDefaultLabelingMethods',
      'setDefaultLabelingMethod',
      'setDefaultLabelingModel',
      'setModelServices',
      'setSamplingStrategy',
      'setNBatch',
      'setShowDatasetOverview',
      'setSingleObjectDisplayEnabled',
      'setGridMatrixEnabled',
      'setItemsPerRow',
      'setItemsPerCol',
      'setInterimModelTrainingEnabled',
      'setLabelTasks',
      'executeFeatureExtraction',
    ]),
    onSelectNode(node: WorkflowNode) {
      this.selectedNode = node;
    },
    onRemoveNode(node: WorkflowNode) {
      if (node.type === NodeTypes.DataObjectSelection) {
        this.setSamplingStrategy(SamplingStrategyType.Random);
        this.setShowDatasetOverview(false);
        this.setNBatch(1);
      }
      if (node.type === NodeTypes.DefaultLabeling) {
        this.setDefaultLabelingMethod({
          name: 'Null (Dummy)',
          serverless: true,
          api: 'Null',
          parameters: ['features'],
          isBuiltIn: true,
          id: 'Null-35514905',
        });
      }
      if (node.type === NodeTypes.InteractiveLabeling) {
        this.setSingleObjectDisplayEnabled(false);
        this.setGridMatrixEnabled(false);
      }
      if (node.type === NodeTypes.InterimModelTraining) {
        this.setInterimModelTrainingEnabled(false);
      }
    },
    onEditNode(newValue: WorkflowNode) {
      const newGraph = { ...this.graph };
      const idx = newGraph.nodes.findIndex((d) => d.id === newValue.id);
      newGraph.nodes[idx] = newValue;
      this.graph = newGraph;
      if (newValue.type === NodeTypes.FeatureExtraction) {
        this.setFeatureExtractionMethod(newValue.value);
      }
      if (newValue.type === NodeTypes.DefaultLabeling) {
        const { method, model } = (newValue as DefaultLabelingNode).value;
        this.setDefaultLabelingMethod(method);
        this.setDefaultLabelingModel(model);
      }
      this.selectedNode = newValue;
    },
    onSetNodeValue(node: WorkflowNode, value: unknown) {
      const newGraph = { ...this.graph };
      const idx = newGraph.nodes.findIndex((d) => d.id === node.id);
      newGraph.nodes[idx].value = value;
      this.graph = newGraph;

      if (node.type === NodeTypes.LabelTask) {
        this.setLabelTasks(value);
      }
      if (node.type === NodeTypes.FeatureExtraction) {
        this.setFeatureExtractionMethod(value);
      }
      if (node.type === NodeTypes.DefaultLabeling) {
        const { method } = (node as DefaultLabelingNode).value;
        this.setDefaultLabelingMethod(method);
      }
      if (node.type === NodeTypes.DataObjectSelection) {
        const {
          strategy,
          nBatch,
          projectionAidEnabled,
        } = value;
        this.setSamplingStrategy(strategy);
        this.setNBatch(nBatch);
        this.setShowDatasetOverview(projectionAidEnabled);
      }
      if (node.type === NodeTypes.InteractiveLabeling) {
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
      if (node.type === NodeTypes.InterimModelTraining) {
        const { enabled } = value;
        this.setInterimModelTrainingEnabled(enabled);
      }
    },
    onEditMethod(nodeType: NodeTypes, newValue: FeatureExtractionMethod) {
      if (nodeType === NodeTypes.FeatureExtraction) {
        const { featureExtractionMethods } = this;
        const idx = featureExtractionMethods.findIndex((d) => d.id === newValue.id);
        const newFeatureExtractionMethods = [...featureExtractionMethods];
        newFeatureExtractionMethods[idx] = newValue;
        this.setFeatureExtractionMethods(newFeatureExtractionMethods);
      }
      if (nodeType === NodeTypes.DefaultLabeling) {
        const { defaultLabelingMethods } = this;
        const idx = defaultLabelingMethods.findIndex((d) => d.id === newValue.id);
        const newDefaultLabelingMethods = [...defaultLabelingMethods];
        newDefaultLabelingMethods[idx] = newValue;
        this.setDefaultLabelingMethods(newDefaultLabelingMethods);
      }
    },
    onCreateMethod(nodeType: NodeTypes) {
      if (nodeType === NodeTypes.FeatureExtraction) {
        const { featureExtractionMethods } = this;
        const method = {
          name: 'custom',
          serverless: false,
          api: '',
          parameters: ['dataObjects'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setFeatureExtractionMethods([
          ...featureExtractionMethods,
          method,
        ]);
      } else if (nodeType === NodeTypes.DefaultLabeling) {
        const { defaultLabelingMethods } = this;
        const method = {
          name: 'custom',
          serverless: false,
          api: '',
          parameters: ['features', 'model'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setDefaultLabelingMethods([
          ...defaultLabelingMethods,
          method,
        ]);
      }
    },
    onEditModel(newValue: ModelService) {
      const { modelServices } = this;
      const idx = modelServices.findIndex((d: ModelService) => d.id === newValue.id);
      const newModelServices = [...modelServices];
      newModelServices[idx] = newValue;
      this.setModelServices(newModelServices);
    },
    onCreateModel() {
      const { modelServices } = this;
      const model: ModelService = {
        name: 'custom',
        serverless: false,
        api: '',
        isBuiltIn: false,
        id: `custom-${uuidv4()}`,
      };
      this.setModelServices([
        ...modelServices,
        model,
      ]);
    },
    onClickRecompute(node: WorkflowNode) {
      if (node.type === NodeTypes.FeatureExtraction) {
        this.executeFeatureExtraction(node.value);
      }
    },
  },
});
</script>
