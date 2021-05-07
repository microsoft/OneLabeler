<template>
  <component
    :is="component"
    :methods="methodsFiltered"
    :models="modelsFiltered"
    :node="node"
    :edge="edge"
    @edit:node="onEditNode"
    @create:method="onCreateMethod"
    @edit:method="onEditMethod"
    @create:model="onCreateModel"
    @edit:model="onEditModel"
  />
</template>

<script lang="ts">
import Vue, { PropType, VueConstructor } from 'vue';
import ObjectId from 'bson-objectid';
import { v4 as uuidv4 } from 'uuid';
import {
  ModelService,
  Process,
  ProcessType,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import TheEdgeDetails from './TheEdgeDetails.vue';
import TheElementDetailsSelectionEmpty from './TheElementDetailsSelectionEmpty.vue';
import TheElementDetailsSelectionMultiple from './TheElementDetailsSelectionMultiple.vue';
import TheNodeDetailsDataObjectSelection from './TheNodeDetailsDataObjectSelection.vue';
import TheNodeDetailsDecision from './TheNodeDetailsDecision.vue';
import TheNodeDetailsDefaultLabeling from './TheNodeDetailsDefaultLabeling.vue';
import TheNodeDetailsFeatureExtraction from './TheNodeDetailsFeatureExtraction.vue';
import TheNodeDetailsInteractiveLabeling from './TheNodeDetailsInteractiveLabeling.vue';
import TheNodeDetailsInterimModelTraining from './TheNodeDetailsInterimModelTraining.vue';
import TheNodeDetailsInitialization from './TheNodeDetailsInitialization.vue';
import TheNodeDetailsStoppageAnalysis from './TheNodeDetailsStoppageAnalysis.vue';
import TheNodeDetailsTaskTransformation from './TheNodeDetailsTaskTransformation.vue';
import TheNodeDetailsTerminal from './TheNodeDetailsTerminal.vue';

const isElementNode = (
  element: WorkflowNode | WorkflowEdge,
): boolean => 'type' in element;

export default Vue.extend({
  name: 'TheElementDetails',
  components: {
    TheEdgeDetails,
    TheElementDetailsSelectionEmpty,
    TheElementDetailsSelectionMultiple,
    TheNodeDetailsDataObjectSelection,
    TheNodeDetailsDecision,
    TheNodeDetailsDefaultLabeling,
    TheNodeDetailsFeatureExtraction,
    TheNodeDetailsInteractiveLabeling,
    TheNodeDetailsInterimModelTraining,
    TheNodeDetailsInitialization,
    TheNodeDetailsStoppageAnalysis,
    TheNodeDetailsTaskTransformation,
    TheNodeDetailsTerminal,
  },
  props: {
    methods: {
      type: Array as PropType<Process[]>,
      default: () => [],
    },
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    selection: {
      type: Array as PropType<(WorkflowNode | WorkflowEdge)[]>,
      default: () => [],
    },
  },
  computed: {
    node(): WorkflowNode | null {
      const { selection } = this;
      if (selection.length !== 1) return null;
      const [element] = selection;
      return isElementNode(element) ? (element as WorkflowNode) : null;
    },
    edge(): WorkflowEdge | null {
      const { selection } = this;
      if (selection.length !== 1) return null;
      const [element] = selection;
      return isElementNode(element) ? null : (element as WorkflowEdge);
    },
    component(): VueConstructor {
      const { edge, node, selection } = this;
      if (selection.length === 0) return TheElementDetailsSelectionEmpty;
      if (selection.length >= 2) return TheElementDetailsSelectionMultiple;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: TheNodeDetailsDataObjectSelection,
        [WorkflowNodeType.Decision]: TheNodeDetailsDecision,
        [WorkflowNodeType.DefaultLabeling]: TheNodeDetailsDefaultLabeling,
        [WorkflowNodeType.FeatureExtraction]: TheNodeDetailsFeatureExtraction,
        [WorkflowNodeType.InteractiveLabeling]: TheNodeDetailsInteractiveLabeling,
        [WorkflowNodeType.InterimModelTraining]: TheNodeDetailsInterimModelTraining,
        [WorkflowNodeType.StoppageAnalysis]: TheNodeDetailsStoppageAnalysis,
        [WorkflowNodeType.TaskTransformation]: TheNodeDetailsTaskTransformation,
        [WorkflowNodeType.Initialization]: TheNodeDetailsInitialization,
        [WorkflowNodeType.Terminal]: TheNodeDetailsTerminal,
      } as Partial<Record<WorkflowNodeType, VueConstructor>>;
      if (node !== null && node.type in mapper) return mapper[node.type] as VueConstructor;
      if (edge !== null) return TheEdgeDetails as VueConstructor;
      return TheElementDetailsSelectionEmpty;
    },
    methodsFiltered(): Process[] | null {
      const { node } = this;
      if (node === null) return null;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: ProcessType.DataObjectSelection,
        [WorkflowNodeType.DefaultLabeling]: ProcessType.DefaultLabeling,
        [WorkflowNodeType.FeatureExtraction]: ProcessType.FeatureExtraction,
        [WorkflowNodeType.InteractiveLabeling]: ProcessType.InteractiveLabeling,
        [WorkflowNodeType.InterimModelTraining]: ProcessType.InterimModelTraining,
        [WorkflowNodeType.StoppageAnalysis]: ProcessType.StoppageAnalysis,
        [WorkflowNodeType.TaskTransformation]: ProcessType.TaskTransformation,
      } as Record<WorkflowNodeType, ProcessType>;
      if (!(node.type in mapper)) return [];
      const processType = mapper[node.type];
      return (this.methods as Process[])
        .filter((d) => d.type === processType);
    },
    modelsFiltered(): ModelService[] | null {
      const { node } = this;
      if (node === null) return null;
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        return this.models.filter((d: ModelService) => d.isValidSampler);
      }
      if (node.type === WorkflowNodeType.DefaultLabeling
        || node.type === WorkflowNodeType.InterimModelTraining
      ) {
        return this.models;
      }
      return null;
    },
  },
  methods: {
    onEditNode(newValue: WorkflowNode): void {
      this.$emit('edit:node', newValue);
    },
    onEditMethod(newValue: Process): void {
      this.$emit('edit:method', newValue);
    },
    onCreateMethod(): void {
      const { node } = this;
      if (node === null) return;
      const nodeType = node.type;
      let method = {
        label: 'custom',
        id: `custom-${uuidv4()}`,
        isAlgorithmic: true,
        isBuiltIn: false,
        isModelBased: false,
        isServerless: false,
        api: '',
      } as Partial<Process>;
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
      this.$emit('create:method', method);
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit:model', newValue);
    },
    onCreateModel(): void {
      const model: ModelService = {
        label: 'custom',
        isBuiltIn: false,
        isServerless: false,
        isValidSampler: true,
        type: '',
        objectId: (new ObjectId()).toHexString(),
      };
      this.$emit('create:model', model);
    },
  },
});
</script>
