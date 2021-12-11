<template>
  <TheNodeDetailsModule
    :methods="methodsFiltered"
    :models="modelsFiltered"
    :node="node"
    :view-title="viewTitle"
    :module-inputs="moduleInputs"
    :module-outputs="moduleOutputs"
    @edit:node="$emit('edit:node', $event)"
    @create:module="onCreateModule"
    @update:module="$emit('update:module', $event)"
    @create:model="onCreateModel"
    @edit:model="$emit('edit:model', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import ObjectId from 'bson-objectid';
import { v4 as uuidv4 } from 'uuid';
import { ModuleType, WorkflowNodeType } from '@/commons/types';
import type {
  ModelService,
  IModule,
  WorkflowNode,
} from '@/commons/types';
import {
  InitializationNode,
  DecisionNode,
  ExitNode,
  DataObjectSelectionNode,
  DefaultLabelingNode,
  FeatureExtractionNode,
  InteractiveLabelingNode,
  ModelTrainingNode,
  StoppageAnalysisNode,
  CustomNode,
} from '@/commons/workflow-utils/build-node';
import TheNodeDetailsModule from './TheNodeDetailsModule.vue';

const NODE_TYPES = [
  InitializationNode,
  DecisionNode,
  ExitNode,
  DataObjectSelectionNode,
  DefaultLabelingNode,
  FeatureExtractionNode,
  InteractiveLabelingNode,
  ModelTrainingNode,
  StoppageAnalysisNode,
  CustomNode,
];

export default defineComponent({
  name: 'TheNodeDetails',
  components: { TheNodeDetailsModule },
  props: {
    methods: {
      type: Array as PropType<IModule[]>,
      default: () => [],
    },
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  emits: {
    'edit:node': null,
    'update:module': null,
    'edit:model': null,
    'create:module': null,
    'create:model': null,
  },
  computed: {
    viewTitle(): string {
      const { node } = this;
      const mapper = {
        [WorkflowNodeType.Initialization]: 'Initialization Setting',
        [WorkflowNodeType.Decision]: 'Conditional Branching',
        [WorkflowNodeType.Exit]: 'Exit',
        [WorkflowNodeType.Base]: 'Custom Instantiation',
        [WorkflowNodeType.DataObjectSelection]: 'Data Object Selection Instantiation',
        [WorkflowNodeType.DefaultLabeling]: 'Default Labeling Instantiation',
        [WorkflowNodeType.FeatureExtraction]: 'Feature Extraction Instantiation',
        [WorkflowNodeType.InteractiveLabeling]: 'Interactive Labeling Instantiation',
        [WorkflowNodeType.ModelTraining]: 'Interim Model Training Instantiation',
        [WorkflowNodeType.StoppageAnalysis]: 'Stoppage Analysis Instantiation',
      } as Partial<Record<WorkflowNodeType, string>>;
      return mapper[node.type] ?? '';
    },
    moduleInputs(): string[] {
      const { node } = this;
      const typeToInputs: Partial<
        Record<WorkflowNodeType, string[]>
      > = Object.fromEntries(NODE_TYPES
        .map((d) => ([d.type, d.possibleInputs])));
      return typeToInputs[node.type] ?? [];
    },
    moduleOutputs(): string[] {
      const { node } = this;
      const typeToOutputs: Partial<
        Record<WorkflowNodeType, string[]>
      > = Object.fromEntries(NODE_TYPES
        .map((d) => ([d.type, d.possibleOutputs])));
      return typeToOutputs[node.type] ?? [];
    },
    methodsFiltered(): IModule[] | null {
      const { node } = this;
      if (node === null) return null;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: ModuleType.DataObjectSelection,
        [WorkflowNodeType.DefaultLabeling]: ModuleType.DefaultLabeling,
        [WorkflowNodeType.FeatureExtraction]: ModuleType.FeatureExtraction,
        [WorkflowNodeType.InteractiveLabeling]: ModuleType.InteractiveLabeling,
        [WorkflowNodeType.ModelTraining]: ModuleType.ModelTraining,
        [WorkflowNodeType.StoppageAnalysis]: ModuleType.StoppageAnalysis,
        [WorkflowNodeType.Base]: ModuleType.Base,
      } as Record<WorkflowNodeType, ModuleType>;
      if (!(node.type in mapper)) return [];
      const processType = mapper[node.type];
      return this.methods.filter((d) => d.type === processType);
    },
    modelsFiltered(): ModelService[] | null {
      const { node } = this;
      if (node === null) return null;
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        return this.models.filter((d: ModelService) => d.isValidSampler);
      }
      if (node.type === WorkflowNodeType.DefaultLabeling
        || node.type === WorkflowNodeType.ModelTraining
      ) {
        return this.models;
      }
      return null;
    },
  },
  methods: {
    onCreateModule(): void {
      const { node } = this;
      if (node === null) return;
      const nodeType = node.type;
      let method = {
        label: 'custom',
        id: `custom-${uuidv4()}`,
        isAlgorithmic: true,
        isBuiltIn: false,
        isServerless: false,
        api: '',
      } as Partial<IModule>;
      if (nodeType === WorkflowNodeType.DataObjectSelection) {
        method = {
          ...method,
          type: ModuleType.DataObjectSelection,
          inputs: ['labels'],
          outputs: ['queryUuids'],
        };
      }
      if (nodeType === WorkflowNodeType.DefaultLabeling) {
        method = {
          ...method,
          type: ModuleType.DefaultLabeling,
          inputs: ['features', 'model'],
          outputs: ['labels'],
        };
      }
      if (nodeType === WorkflowNodeType.FeatureExtraction) {
        method = {
          ...method,
          type: ModuleType.FeatureExtraction,
          inputs: ['dataObjects'],
          outputs: ['features'],
        };
      }
      if (nodeType === WorkflowNodeType.ModelTraining) {
        method = {
          ...method,
          type: ModuleType.ModelTraining,
          inputs: ['model'],
          outputs: ['model'],
        };
      }
      if (nodeType === WorkflowNodeType.StoppageAnalysis) {
        method = {
          ...method,
          type: ModuleType.StoppageAnalysis,
          inputs: ['labels'],
          outputs: ['stop'],
        };
      }
      if (nodeType === WorkflowNodeType.Base) {
        method = {
          ...method,
          type: ModuleType.Base,
          inputs: [],
          outputs: [],
        };
      }
      this.$emit('create:module', method);
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
