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
        <TheNodeDetails
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
import ObjectId from 'bson-objectid';
import { v4 as uuidv4 } from 'uuid';
import {
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  FeatureExtractionMethod,
  DefaultLabelingMethod,
  InterimModelTrainingMethod,
  ModelService,
  InteractiveLabelingMethod,
} from '@/commons/types';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import TheNodeDetails from './TheNodeDetails.vue';
import {
  WorkflowNode,
  NodeTypes,
  DefaultLabelingNode,
  InterimModelTrainingNode,
  FeatureExtractionNode,
  InteractiveLabelingNode,
} from './types';

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
        method: {
          name: 'SVD (Unsupervised)',
          serverless: false,
          api: 'http://localhost:8005/features/image/SVD',
          parameters: ['dataObjects'],
          isBuiltIn: true,
          id: 'image-SVD-25940167',
        },
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
      value: [],
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
        method: {
          name: 'Static',
          serverless: true,
          api: 'Static',
          parameters: ['model'],
          isBuiltIn: true,
          id: 'Static-72885436',
        },
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
  name: 'TheWorkflowGraphView',
  components: {
    TheWorkflowGraphViewCanvas,
    TheNodeDetails,
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
      'interimModelTrainingMethods',
      'interactiveLabelingMethods',
    ]),
  },
  methods: {
    ...mapActions('workflow', [
      'setModelServices',
      'setFeatureExtractionMethods',
      'setFeatureExtractionMethod',
      'setDefaultLabelingMethods',
      'setDefaultLabelingMethod',
      'setDefaultLabelingModel',
      'setInterimModelTrainingMethods',
      'setInterimModelTrainingMethod',
      'setInteractiveLabelingMethods',
      'setInteractiveLabelingMethod',
      'setSingleObjectDisplayEnabled',
      'setGridMatrixEnabled',
      'setSamplingStrategy',
      'setNBatch',
      'setShowDatasetOverview',
      'setLabelTasks',
      'executeFeatureExtraction',
      'executeDefaultLabeling',
      'executeInterimModelTraining',
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
      if (node.type === NodeTypes.InterimModelTraining) {
        this.setInterimModelTrainingMethod({
          name: 'Static',
          serverless: true,
          api: 'Static',
          parameters: ['model'],
          isBuiltIn: true,
          id: 'Static-72885436',
        });
      }
      if (node.type === NodeTypes.InteractiveLabeling) {
        this.setInteractiveLabelingMethod([]);
      }
    },
    onEditNode(newValue: WorkflowNode) {
      const newGraph = { ...this.graph };
      const idx = newGraph.nodes.findIndex((d) => d.id === newValue.id);
      newGraph.nodes[idx] = newValue;
      this.graph = newGraph;
      if (newValue.type === NodeTypes.FeatureExtraction) {
        const { method } = (newValue as FeatureExtractionNode).value;
        this.setFeatureExtractionMethod(method);
      }
      if (newValue.type === NodeTypes.DefaultLabeling) {
        const { method, model } = (newValue as DefaultLabelingNode).value;
        this.setDefaultLabelingMethod(method);
        this.setDefaultLabelingModel(model);
      }
      if (newValue.type === NodeTypes.InterimModelTraining) {
        const { method } = (newValue as InterimModelTrainingNode).value;
        this.setInterimModelTrainingMethod(method);
      }
      if (newValue.type === NodeTypes.InteractiveLabeling) {
        const method = (newValue as InteractiveLabelingNode).value.map((d) => d.method);
        this.setInteractiveLabelingMethod(method);
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
        const { method } = (node as FeatureExtractionNode).value;
        this.setFeatureExtractionMethod(method);
      }
      if (node.type === NodeTypes.DefaultLabeling) {
        const { method } = (node as DefaultLabelingNode).value;
        this.setDefaultLabelingMethod(method);
      }
      if (node.type === NodeTypes.InterimModelTraining) {
        const { method } = (node as InterimModelTrainingNode).value;
        this.setInterimModelTrainingMethod(method);
      }
      if (node.type === NodeTypes.InteractiveLabeling) {
        const method = (node as InteractiveLabelingNode).value;
        this.setInteractiveLabelingMethod(method);
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
    },
    onEditMethod(nodeType: NodeTypes, newValue: FeatureExtractionMethod) {
      if (nodeType === NodeTypes.FeatureExtraction) {
        const methods = this.featureExtractionMethods as FeatureExtractionMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setFeatureExtractionMethods(newMethods);
      }
      if (nodeType === NodeTypes.DefaultLabeling) {
        const methods = this.defaultLabelingMethods as DefaultLabelingMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setDefaultLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.InterimModelTraining) {
        const methods = this.interimModelTrainingMethods as InterimModelTrainingMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setDefaultLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.InteractiveLabeling) {
        const methods = this.interactiveLabelingMethods as InteractiveLabelingMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setInteractiveLabelingMethods(newMethods);
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
      } else if (nodeType === NodeTypes.InterimModelTraining) {
        const { interimModelTrainingMethods } = this;
        const method = {
          name: 'custom',
          serverless: false,
          api: '',
          parameters: ['model'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setInterimModelTrainingMethods([
          ...interimModelTrainingMethods,
          method,
        ]);
      }
    },
    onEditModel(newValue: ModelService) {
      const { modelServices } = this;
      const idx = modelServices.findIndex(
        (d: ModelService) => d.objectId === newValue.objectId,
      );
      const newModelServices = [...modelServices];
      newModelServices[idx] = newValue;
      this.setModelServices(newModelServices);
    },
    onCreateModel() {
      const { modelServices } = this;
      const model: ModelService = {
        name: 'custom',
        serverless: false,
        type: '',
        isBuiltIn: false,
        objectId: (new ObjectId()).toHexString(),
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
      if (node.type === NodeTypes.DefaultLabeling) {
        this.executeDefaultLabeling(node.value);
      }
      if (node.type === NodeTypes.InterimModelTraining) {
        this.executeInterimModelTraining(node.value);
      }
    },
  },
});
</script>
