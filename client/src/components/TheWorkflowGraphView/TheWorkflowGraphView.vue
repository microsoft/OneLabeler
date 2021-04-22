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
          @create:method="onCreateMethod(selectedNode.type)"
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
} from '@/commons/types';
import graph from '@/commons/graph-template';
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
      const { methods } = this;
      const idx = methods.findIndex((d) => d.id === newValue.id);
      const newMethods = [...methods];
      newMethods[idx] = newValue;
      if (nodeType === NodeTypes.DataObjectSelection) {
        this.setDataObjectSelectionMethods(newMethods);
      }
      if (nodeType === NodeTypes.DefaultLabeling) {
        this.setDefaultLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.FeatureExtraction) {
        this.setFeatureExtractionMethods(newMethods);
      }
      if (nodeType === NodeTypes.InteractiveLabeling) {
        this.setInteractiveLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.InterimModelTraining) {
        this.setDefaultLabelingMethods(newMethods);
      }
      if (nodeType === NodeTypes.StoppageAnalysis) {
        this.setStoppageAnalysisMethods(newMethods);
      }
      if (nodeType === NodeTypes.TaskTransformation) {
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
