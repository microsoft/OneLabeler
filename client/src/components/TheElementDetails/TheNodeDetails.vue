<template>
  <component
    :is="component"
    :methods="methodsFiltered"
    :models="modelsFiltered"
    :node="node"
    :view-title="viewTitle"
    :module-inputs="moduleInputs"
    :module-outputs="moduleOutputs"
    @edit:node="$emit('edit:node', $event)"
    @create:method="onCreateMethod"
    @edit:method="$emit('edit:method', $event)"
    @create:model="onCreateModel"
    @edit:model="$emit('edit:model', $event)"
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
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
import TheNodeDetailsMulti from './TheNodeDetailsMulti.vue';
import TheNodeDetailsDecision from './TheNodeDetailsDecision.vue';
import TheNodeDetailsSingle from './TheNodeDetailsSingle.vue';
import TheNodeDetailsInitialization from './TheNodeDetailsInitialization.vue';
import TheNodeDetailsExit from './TheNodeDetailsExit.vue';

export default Vue.extend({
  name: 'TheElementDetails',
  props: {
    methods: {
      type: Array as PropType<Process[]>,
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
  computed: {
    component(): VueConstructor {
      const { node } = this;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: TheNodeDetailsMulti,
        [WorkflowNodeType.Decision]: TheNodeDetailsDecision,
        [WorkflowNodeType.DefaultLabeling]: TheNodeDetailsSingle,
        [WorkflowNodeType.FeatureExtraction]: TheNodeDetailsSingle,
        [WorkflowNodeType.InteractiveLabeling]: TheNodeDetailsMulti,
        [WorkflowNodeType.ModelTraining]: TheNodeDetailsSingle,
        [WorkflowNodeType.StoppageAnalysis]: TheNodeDetailsSingle,
        [WorkflowNodeType.Custom]: TheNodeDetailsSingle,
        [WorkflowNodeType.Initialization]: TheNodeDetailsInitialization,
        [WorkflowNodeType.Exit]: TheNodeDetailsExit,
      } as Partial<Record<WorkflowNodeType, VueConstructor>>;
      return mapper[node.type] as VueConstructor;
    },
    viewTitle(): string {
      const { node } = this;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: 'Data Object Selection Instantiation',
        [WorkflowNodeType.DefaultLabeling]: 'Default Labeling Instantiation',
        [WorkflowNodeType.FeatureExtraction]: 'Feature Extraction Instantiation',
        [WorkflowNodeType.InteractiveLabeling]: 'Interactive Labeling Instantiation',
        [WorkflowNodeType.ModelTraining]: 'Interim Model Training Instantiation',
        [WorkflowNodeType.StoppageAnalysis]: 'Stoppage Analysis Instantiation',
        [WorkflowNodeType.Custom]: 'Custom Instantiation',
      } as Partial<Record<WorkflowNodeType, string>>;
      return mapper[node.type] ?? '';
    },
    moduleInputs(): string[] {
      const { node } = this;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: [
          'labels',
          'features',
          'model',
          'samples',
        ],
        [WorkflowNodeType.DefaultLabeling]: [
          'dataObjects',
          'queryUuids',
          'features',
          'model',
        ],
        [WorkflowNodeType.FeatureExtraction]: ['dataObjects', 'labels'],
        [WorkflowNodeType.InteractiveLabeling]: ['dataObjects', 'samples'],
        [WorkflowNodeType.ModelTraining]: [
          'model',
          'features',
          'labels',
        ],
        [WorkflowNodeType.StoppageAnalysis]: [
          'labels',
          'model',
          'features',
          'dataObjects',
        ],
        [WorkflowNodeType.Custom]: [
          'dataObjects',
          'labels',
          'samples',
          'features',
          'model',
          'stop',
        ],
      } as Partial<Record<WorkflowNodeType, string[]>>;
      return mapper[node.type] ?? [];
    },
    moduleOutputs(): string[] {
      const { node } = this;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: ['samples'],
        [WorkflowNodeType.DefaultLabeling]: ['labels'],
        [WorkflowNodeType.FeatureExtraction]: ['features'],
        [WorkflowNodeType.InteractiveLabeling]: ['labels'],
        [WorkflowNodeType.ModelTraining]: ['model'],
        [WorkflowNodeType.StoppageAnalysis]: ['stop'],
        [WorkflowNodeType.Custom]: [
          'dataObjects',
          'labels',
          'samples',
          'features',
          'model',
          'stop',
        ],
      } as Partial<Record<WorkflowNodeType, string[]>>;
      return mapper[node.type] ?? [];
    },
    methodsFiltered(): Process[] | null {
      const { node } = this;
      if (node === null) return null;
      const mapper = {
        [WorkflowNodeType.DataObjectSelection]: ProcessType.DataObjectSelection,
        [WorkflowNodeType.DefaultLabeling]: ProcessType.DefaultLabeling,
        [WorkflowNodeType.FeatureExtraction]: ProcessType.FeatureExtraction,
        [WorkflowNodeType.InteractiveLabeling]: ProcessType.InteractiveLabeling,
        [WorkflowNodeType.ModelTraining]: ProcessType.ModelTraining,
        [WorkflowNodeType.StoppageAnalysis]: ProcessType.StoppageAnalysis,
        [WorkflowNodeType.Custom]: ProcessType.Custom,
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
        || node.type === WorkflowNodeType.ModelTraining
      ) {
        return this.models;
      }
      return null;
    },
  },
  methods: {
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
          outputs: ['samples'],
        };
      }
      if (nodeType === WorkflowNodeType.DefaultLabeling) {
        method = {
          ...method,
          type: ProcessType.DefaultLabeling,
          inputs: ['features', 'model'],
          outputs: ['labels'],
        };
      }
      if (nodeType === WorkflowNodeType.FeatureExtraction) {
        method = {
          ...method,
          type: ProcessType.FeatureExtraction,
          inputs: ['dataObjects'],
          outputs: ['features'],
        };
      }
      if (nodeType === WorkflowNodeType.ModelTraining) {
        method = {
          ...method,
          type: ProcessType.ModelTraining,
          inputs: ['model'],
          outputs: ['model'],
        };
      }
      if (nodeType === WorkflowNodeType.StoppageAnalysis) {
        method = {
          ...method,
          type: ProcessType.StoppageAnalysis,
          inputs: ['labels'],
          outputs: ['stop'],
        };
      }
      if (nodeType === WorkflowNodeType.Custom) {
        method = {
          ...method,
          type: ProcessType.Custom,
          inputs: [],
          outputs: [],
        };
      }
      this.$emit('create:method', method);
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
