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
              :graph="{ nodes, edges }"
              @click:node="onSelectNode"
              @remove:node="onRemoveNode"
            />
            <TheWorkflowGraphViewConsole
              :graph="{ nodes, edges }"
              style="
                position: absolute;
                bottom: 8px;
                left: 8px;
                right: 8px;
                height: 200px;"
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
          :models="modelsFiltered"
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
  Process,
  ProcessType,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import TheNodeDetailsDataObjectSelection from './TheNodeDetailsDataObjectSelection.vue';
import TheNodeDetailsDefaultLabeling from './TheNodeDetailsDefaultLabeling.vue';
import TheNodeDetailsEmpty from './TheNodeDetailsEmpty.vue';
import TheNodeDetailsFeatureExtraction from './TheNodeDetailsFeatureExtraction.vue';
import TheNodeDetailsInteractiveLabeling from './TheNodeDetailsInteractiveLabeling.vue';
import TheNodeDetailsInterimModelTraining from './TheNodeDetailsInterimModelTraining.vue';
import TheNodeDetailsInitialization from './TheNodeDetailsInitialization.vue';
import TheNodeDetailsStoppageAnalysis from './TheNodeDetailsStoppageAnalysis.vue';
import TheNodeDetailsTaskTransformation from './TheNodeDetailsTaskTransformation.vue';
import TheWorkflowGraphViewCanvas from './TheWorkflowGraphViewCanvas.vue';
import TheWorkflowGraphViewConsole from './TheWorkflowGraphViewConsole.vue';

export default Vue.extend({
  name: 'TheWorkflowGraphView',
  components: {
    TheNodeDetailsDataObjectSelection,
    TheNodeDetailsDefaultLabeling,
    TheNodeDetailsEmpty,
    TheNodeDetailsFeatureExtraction,
    TheNodeDetailsInteractiveLabeling,
    TheNodeDetailsInterimModelTraining,
    TheNodeDetailsInitialization,
    TheNodeDetailsStoppageAnalysis,
    TheNodeDetailsTaskTransformation,
    TheWorkflowGraphViewCanvas,
    TheWorkflowGraphViewConsole,
  },
  data() {
    return {
      selectedNode: null as null | WorkflowNode,
    };
  },
  computed: {
    ...mapState('workflow', [
      'nodes',
      'edges',
      'modelServices',
      'processes',
    ]),
    component() {
      const node = this.selectedNode;
      if (node === null) return TheNodeDetailsEmpty;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: TheNodeDetailsDataObjectSelection,
        [WorkflowNodeType.DefaultLabeling]: TheNodeDetailsDefaultLabeling,
        [WorkflowNodeType.FeatureExtraction]: TheNodeDetailsFeatureExtraction,
        [WorkflowNodeType.InteractiveLabeling]: TheNodeDetailsInteractiveLabeling,
        [WorkflowNodeType.InterimModelTraining]: TheNodeDetailsInterimModelTraining,
        [WorkflowNodeType.StoppageAnalysis]: TheNodeDetailsStoppageAnalysis,
        [WorkflowNodeType.TaskTransformation]: TheNodeDetailsTaskTransformation,
        [WorkflowNodeType.Initialization]: TheNodeDetailsInitialization,
      };
      return mapper[(node as WorkflowNode).type];
    },
    methods() {
      const node = this.selectedNode as WorkflowNode;
      if (node === null) return null;
      const mapper: Record<WorkflowNodeType, ProcessType> = {
        [WorkflowNodeType.DataObjectSelection]: ProcessType.DataObjectSelection,
        [WorkflowNodeType.DefaultLabeling]: ProcessType.DefaultLabeling,
        [WorkflowNodeType.FeatureExtraction]: ProcessType.FeatureExtraction,
        [WorkflowNodeType.InteractiveLabeling]: ProcessType.InteractiveLabeling,
        [WorkflowNodeType.InterimModelTraining]: ProcessType.InterimModelTraining,
        [WorkflowNodeType.StoppageAnalysis]: ProcessType.StoppageAnalysis,
        [WorkflowNodeType.TaskTransformation]: ProcessType.TaskTransformation,
      };
      if (!(node.type in mapper)) return [];
      const processType = mapper[node.type];
      return (this.processes as Process[])
        .filter((d) => d.type === processType);
    },
    modelsFiltered() {
      const node = this.selectedNode;
      if (node === null) return null;
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        return this.modelServices.filter((d: ModelService) => d.isValidSampler);
      }
      if (node.type === WorkflowNodeType.DefaultLabeling
        || node.type === WorkflowNodeType.InterimModelTraining
      ) {
        return this.modelServices;
      }
      return null;
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setModelServices',
      'editNode',
      'removeNode',
      'pushProcesses',
      'editProcess',
      'executeDataObjectSelectionAlgorithmic',
      'executeDefaultLabeling',
      'executeFeatureExtraction',
      'executeInterimModelTraining',
    ]),
    onSelectNode(node: WorkflowNode) {
      this.selectedNode = node;
    },
    onRemoveNode(node: WorkflowNode) {
      this.removeNode(node);
    },
    onEditNode(newValue: WorkflowNode) {
      this.editNode(newValue);
      this.selectedNode = newValue;
    },
    onEditMethod(newValue: Process) {
      this.editProcess(newValue);
    },
    onCreateMethod(nodeType: WorkflowNodeType) {
      let method = {
        name: 'custom',
        id: `custom-${uuidv4()}`,
        isAlgorithmic: true,
        isBuiltIn: false,
        isModelBased: false,
        isServerless: false,
        api: '',
      } as Record<string, unknown>;
      if (nodeType === WorkflowNodeType.DataObjectSelection) {
        method = {
          ...method,
          type: ProcessType.DataObjectSelection,
          inputs: ['labels'],
        };
      }
      if (nodeType === WorkflowNodeType.DefaultLabeling) {
        method = {
          ...method,
          type: ProcessType.DefaultLabeling,
          inputs: ['features', 'model'],
        };
      }
      if (nodeType === WorkflowNodeType.FeatureExtraction) {
        method = {
          ...method,
          type: ProcessType.FeatureExtraction,
          inputs: ['dataObjects'],
        };
      }
      if (nodeType === WorkflowNodeType.InterimModelTraining) {
        method = {
          ...method,
          type: ProcessType.InterimModelTraining,
          inputs: ['model'],
        };
      }
      if (nodeType === WorkflowNodeType.StoppageAnalysis) {
        method = {
          ...method,
          type: ProcessType.StoppageAnalysis,
          inputs: ['labels'],
        };
      }
      this.pushProcesses(method);
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
        isValidSampler: true,
        type: '',
        objectId: (new ObjectId()).toHexString(),
      };
      this.setModelServices([
        ...modelServices,
        model,
      ]);
    },
    onClickRecompute(node: WorkflowNode) {
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        this.executeDataObjectSelectionAlgorithmic(node.value);
      }
      if (node.type === WorkflowNodeType.DefaultLabeling) {
        this.executeDefaultLabeling(node.value);
      }
      if (node.type === WorkflowNodeType.FeatureExtraction) {
        this.executeFeatureExtraction(node.value);
      }
      if (node.type === WorkflowNodeType.InterimModelTraining) {
        this.executeInterimModelTraining(node.value);
      }
    },
  },
});
</script>
