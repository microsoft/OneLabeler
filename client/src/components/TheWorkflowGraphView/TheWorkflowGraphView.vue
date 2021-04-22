<template>
  <!-- The configuration menus. -->
  <v-container
    class="pa-0"
    style="max-width: 1700px"
  >
    <v-row no-gutters>
      <v-col
        class="pr-1"
        style="flex-basis: 60%;"
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
              @click:node="onSelectNode"
              @remove:node="onRemoveNode"
            />
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col
        class="pl-1"
        style="flex-basis: 40%;"
      >
        <!-- The process parameter panel. -->
        <component
          :is="component"
          :methods="methods"
          :models="models"
          :node="selectedNode"
          @edit:node="onEditNode"
          @create:method="onCreateMethod"
          @edit:method="onEditMethod"
          @create:model="onCreateModel"
          @edit:model="onEditModel"
          @click:recompute="onClickRecompute"
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
  ModelService,
  ProcessMethod,
  DataObjectSelectionMethod,
  DefaultLabelingMethod,
  FeatureExtractionMethod,
  InteractiveLabelingMethod,
  InterimModelTrainingMethod,
  TaskTransformationMethod,
  StoppageAnalysisMethod,
} from '@/commons/types';
import TheNodeDetailsDataObjectSelection from './TheNodeDetailsDataObjectSelection.vue';
import TheNodeDetailsDefaultLabeling from './TheNodeDetailsDefaultLabeling.vue';
import TheNodeDetailsEmpty from './TheNodeDetailsEmpty.vue';
import TheNodeDetailsFeatureExtraction from './TheNodeDetailsFeatureExtraction.vue';
import TheNodeDetailsInteractiveLabeling from './TheNodeDetailsInteractiveLabeling.vue';
import TheNodeDetailsInterimModelTraining from './TheNodeDetailsInterimModelTraining.vue';
import TheNodeDetailsLabelTask from './TheNodeDetailsLabelTask.vue';
import TheNodeDetailsStoppageAnalysis from './TheNodeDetailsStoppageAnalysis.vue';
import TheNodeDetailsTaskTransformation from './TheNodeDetailsTaskTransformation.vue';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import {
  WorkflowNode,
  NodeTypes,
  DataObjectSelectionNode,
  DefaultLabelingNode,
  FeatureExtractionNode,
  InteractiveLabelingNode,
  InterimModelTrainingNode,
  TaskTransformationNode,
  StoppageAnalysisNode,
  LabelTaskNode,
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
          isServerless: false,
          api: 'http://localhost:8005/features/image/SVD',
          inputs: ['dataObjects'],
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
      value: [],
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
          isServerless: true,
          api: 'Null',
          inputs: ['features'],
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
        method: {
          name: 'DirectLabeling',
          inputs: ['dataObjects', 'labelTask', 'labelSpace'],
          isBuiltIn: true,
          id: 'DirectLabeling-97377357',
        },
      },
      x: 505,
      y: 25,
    },
    {
      id: 'interactiveLabeling-44216216',
      title: 'interactive labeling',
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
        method: {
          name: 'AllChecked',
          isServerless: true,
          api: 'AllChecked',
          inputs: ['labels'],
          isBuiltIn: true,
          id: 'AllChecked-46322013',
        },
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
          isServerless: true,
          api: 'Static',
          inputs: ['model'],
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
    TheNodeDetailsDataObjectSelection,
    TheNodeDetailsDefaultLabeling,
    TheNodeDetailsEmpty,
    TheNodeDetailsFeatureExtraction,
    TheNodeDetailsInteractiveLabeling,
    TheNodeDetailsInterimModelTraining,
    TheNodeDetailsLabelTask,
    TheNodeDetailsStoppageAnalysis,
    TheNodeDetailsTaskTransformation,
    TheWorkflowGraphViewCanvas,
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
      'dataObjectSelectionMethods',
      'defaultLabelingMethods',
      'featureExtractionMethods',
      'interactiveLabelingMethods',
      'interimModelTrainingMethods',
      'stoppageAnalysisMethods',
      'taskTransformationMethods',
    ]),
    component() {
      const node = this.selectedNode;
      if (node === null) return TheNodeDetailsEmpty;
      const mapper = {
        [NodeTypes.DataObjectSelection]: TheNodeDetailsDataObjectSelection,
        [NodeTypes.DefaultLabeling]: TheNodeDetailsDefaultLabeling,
        [NodeTypes.FeatureExtraction]: TheNodeDetailsFeatureExtraction,
        [NodeTypes.InteractiveLabeling]: TheNodeDetailsInteractiveLabeling,
        [NodeTypes.InterimModelTraining]: TheNodeDetailsInterimModelTraining,
        [NodeTypes.StoppageAnalysis]: TheNodeDetailsStoppageAnalysis,
        [NodeTypes.TaskTransformation]: TheNodeDetailsTaskTransformation,
        [NodeTypes.LabelTask]: TheNodeDetailsLabelTask,
      };
      return mapper[(node as WorkflowNode).type];
    },
    methods() {
      const node = this.selectedNode;
      if (node === null) return null;
      const mapper = {
        [NodeTypes.DataObjectSelection]: this.dataObjectSelectionMethods,
        [NodeTypes.DefaultLabeling]: this.defaultLabelingMethods,
        [NodeTypes.FeatureExtraction]: this.featureExtractionMethods,
        [NodeTypes.InteractiveLabeling]: this.interactiveLabelingMethods,
        [NodeTypes.InterimModelTraining]: this.interimModelTrainingMethods,
        [NodeTypes.StoppageAnalysis]: this.stoppageAnalysisMethods,
        [NodeTypes.TaskTransformation]: this.taskTransformationMethods,
        [NodeTypes.LabelTask]: null,
      };
      return mapper[(node as WorkflowNode).type];
    },
    models() {
      const node = this.selectedNode;
      if (node === null) return TheNodeDetailsEmpty;
      if (node.type === NodeTypes.DataObjectSelection) {
        return this.modelServices.filter((d) => d.usableAsSampler);
      }
      if (node.type === NodeTypes.DefaultLabeling
        || node.type === NodeTypes.InterimModelTraining
      ) {
        return this.modelServices;
      }
      return null;
    },
  },
  methods: {
    ...mapActions('workflow', [
      'executeDataObjectSelectionAlgorithmic',
      'executeDefaultLabeling',
      'executeFeatureExtraction',
      'executeInterimModelTraining',
      'setLabelTasks',
      'setModelServices',
      'setDataObjectSelectionMethods',
      'setDataObjectSelectionMethod',
      'setDataObjectSelectionModel',
      'setDefaultLabelingMethods',
      'setDefaultLabelingMethod',
      'setDefaultLabelingModel',
      'setFeatureExtractionMethods',
      'setFeatureExtractionMethod',
      'setInteractiveLabelingMethods',
      'setInteractiveLabelingMethod',
      'setInterimModelTrainingMethods',
      'setInterimModelTrainingMethod',
      'setStoppageAnalysisMethods',
      'setStoppageAnalysisMethod',
      'setTaskTransformationMethods',
      'setTaskTransformationMethod',
    ]),
    onSelectNode(node: WorkflowNode) {
      this.selectedNode = node;
    },
    onRemoveNode(node: WorkflowNode) {
      if (node.type === NodeTypes.DataObjectSelection) {
        this.setDataObjectSelectionMethod([]);
      }
      if (node.type === NodeTypes.DefaultLabeling) {
        this.setDefaultLabelingMethod({
          name: 'Null (Dummy)',
          isServerless: true,
          api: 'Null',
          inputs: ['features'],
          isBuiltIn: true,
          id: 'Null-35514905',
        });
      }
      if (node.type === NodeTypes.InterimModelTraining) {
        this.setInterimModelTrainingMethod({
          name: 'Static',
          isServerless: true,
          api: 'Static',
          inputs: ['model'],
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
      if (newValue.type === NodeTypes.LabelTask) {
        const labelTasks = (newValue as LabelTaskNode).value;
        this.setLabelTasks(labelTasks);
      }
      if (newValue.type === NodeTypes.DataObjectSelection) {
        const method = (newValue as DataObjectSelectionNode).value
          .map((d) => d.method);
        const algorithmicInstantiation = (newValue as DataObjectSelectionNode).value
          .find((d) => d.model !== undefined);
        const model = algorithmicInstantiation === undefined
          ? undefined
          : algorithmicInstantiation.model;
        this.setDataObjectSelectionMethod(method);
        this.setDataObjectSelectionModel(model);
      }
      if (newValue.type === NodeTypes.DefaultLabeling) {
        const { method, model } = (newValue as DefaultLabelingNode).value;
        this.setDefaultLabelingMethod(method);
        this.setDefaultLabelingModel(model);
      }
      if (newValue.type === NodeTypes.FeatureExtraction) {
        const { method } = (newValue as FeatureExtractionNode).value;
        this.setFeatureExtractionMethod(method);
      }
      if (newValue.type === NodeTypes.InteractiveLabeling) {
        const method = (newValue as InteractiveLabelingNode).value.map((d) => d.method);
        this.setInteractiveLabelingMethod(method);
      }
      if (newValue.type === NodeTypes.InterimModelTraining) {
        const { method } = (newValue as InterimModelTrainingNode).value;
        this.setInterimModelTrainingMethod(method);
      }
      if (newValue.type === NodeTypes.StoppageAnalysis) {
        const { method } = (newValue as StoppageAnalysisNode).value;
        this.setStoppageAnalysisMethod(method);
      }
      if (newValue.type === NodeTypes.TaskTransformation) {
        const { method } = (newValue as TaskTransformationNode).value;
        this.setTaskTransformationMethod(method);
      }
      this.selectedNode = newValue;
    },
    onEditMethod(nodeType: NodeTypes, newValue: ProcessMethod) {
      if (nodeType === NodeTypes.DataObjectSelection) {
        const methods = this.dataObjectSelectionMethods as DataObjectSelectionMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setDataObjectSelectionMethods(newMethods);
      }
      if (nodeType === NodeTypes.DefaultLabeling) {
        const methods = this.defaultLabelingMethods as DefaultLabelingMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setDefaultLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.FeatureExtraction) {
        const methods = this.featureExtractionMethods as FeatureExtractionMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setFeatureExtractionMethods(newMethods);
      }
      if (nodeType === NodeTypes.InteractiveLabeling) {
        const methods = this.interactiveLabelingMethods as InteractiveLabelingMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setInteractiveLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.InterimModelTraining) {
        const methods = this.interimModelTrainingMethods as InterimModelTrainingMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setDefaultLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.StoppageAnalysis) {
        const methods = this.stoppageAnalysisMethods as StoppageAnalysisMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setStoppageAnalysisMethods(newMethods);
      }
      if (nodeType === NodeTypes.TaskTransformation) {
        const methods = this.taskTransformationMethods as TaskTransformationMethod[];
        const idx = methods.findIndex((d) => d.id === newValue.id);
        const newMethods = [...methods];
        newMethods[idx] = newValue;
        this.setTaskTransformationMethods(newMethods);
      }
    },
    onCreateMethod(nodeType: NodeTypes) {
      if (nodeType === NodeTypes.DataObjectSelection) {
        const { dataObjectSelectionMethods } = this;
        const method = {
          name: 'custom',
          isServerless: false,
          api: '',
          inputs: ['labels'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setDataObjectSelectionMethods([
          ...dataObjectSelectionMethods,
          method,
        ]);
      }
      if (nodeType === NodeTypes.DefaultLabeling) {
        const { defaultLabelingMethods } = this;
        const method = {
          name: 'custom',
          isServerless: false,
          api: '',
          inputs: ['features', 'model'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setDefaultLabelingMethods([
          ...defaultLabelingMethods,
          method,
        ]);
      }
      if (nodeType === NodeTypes.FeatureExtraction) {
        const { featureExtractionMethods } = this;
        const method = {
          name: 'custom',
          isServerless: false,
          api: '',
          inputs: ['dataObjects'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setFeatureExtractionMethods([
          ...featureExtractionMethods,
          method,
        ]);
      }
      if (nodeType === NodeTypes.InterimModelTraining) {
        const { interimModelTrainingMethods } = this;
        const method = {
          name: 'custom',
          isServerless: false,
          api: '',
          inputs: ['model'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setInterimModelTrainingMethods([
          ...interimModelTrainingMethods,
          method,
        ]);
      }
      if (nodeType === NodeTypes.StoppageAnalysis) {
        const { stoppageAnalysisMethods } = this;
        const method = {
          name: 'custom',
          isServerless: false,
          api: '',
          inputs: ['labels'],
          isBuiltIn: false,
          id: `custom-${uuidv4()}`,
        };
        this.setStoppageAnalysisMethods([
          ...stoppageAnalysisMethods,
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
        isBuiltIn: false,
        isServerless: false,
        usableAsSampler: true,
        type: '',
        objectId: (new ObjectId()).toHexString(),
      };
      this.setModelServices([
        ...modelServices,
        model,
      ]);
    },
    onClickRecompute(node: WorkflowNode) {
      if (node.type === NodeTypes.DataObjectSelection) {
        this.executeDataObjectSelectionAlgorithmic(node.value);
      }
      if (node.type === NodeTypes.DefaultLabeling) {
        this.executeDefaultLabeling(node.value);
      }
      if (node.type === NodeTypes.FeatureExtraction) {
        this.executeFeatureExtraction(node.value);
      }
      if (node.type === NodeTypes.InterimModelTraining) {
        this.executeInterimModelTraining(node.value);
      }
    },
  },
});
</script>
