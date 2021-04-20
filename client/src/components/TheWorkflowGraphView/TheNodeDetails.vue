<template>
  <!-- The process parameter panel. -->
  <v-container
    class="pa-0"
    fill-height
  >
    <TheNodeDetailsDataObjectSelection
      v-if="(node !== null)
        && (node.type === NodeTypes.DataObjectSelection)"
      :methods="dataObjectSelectionMethods"
      :models="modelServices.filter((d) => d.usableAsSampler)"
      :node="node"
      @edit-node="onEditNode"
      @create-method="onCreateMethod"
      @edit-method="onEditMethod"
      @create-model="onCreateModel"
      @edit-model="onEditModel"
      @click-recompute="onClickRecompute"
    />
    <TheNodeDetailsDefaultLabeling
      v-else-if="(node !== null)
        && (node.type === NodeTypes.DefaultLabeling)"
      :methods="defaultLabelingMethods"
      :models="modelServices"
      :node="node"
      @edit-node="onEditNode"
      @create-method="onCreateMethod"
      @edit-method="onEditMethod"
      @create-model="onCreateModel"
      @edit-model="onEditModel"
      @click-recompute="onClickRecompute"
    />
    <TheNodeDetailsFeatureExtraction
      v-else-if="(node !== null)
        && (node.type === NodeTypes.FeatureExtraction)"
      :methods="featureExtractionMethods"
      :node="node"
      @edit-node="onEditNode"
      @create-method="onCreateMethod"
      @edit-method="onEditMethod"
      @click-recompute="onClickRecompute"
    />
    <TheNodeDetailsInteractiveLabeling
      v-else-if="(node !== null)
        && (node.type === NodeTypes.InteractiveLabeling)"
      :methods="interactiveLabelingMethods"
      :node="node"
      @edit-node="onEditNode"
      @create-method="onCreateMethod"
      @edit-method="onEditMethod"
      @create-model="onCreateModel"
      @edit-model="onEditModel"
      @click-recompute="onClickRecompute"
    />
    <TheNodeDetailsInterimModelTraining
      v-else-if="(node !== null)
        && (node.type === NodeTypes.InterimModelTraining)"
      :methods="interimModelTrainingMethods"
      :models="modelServices"
      :node="node"
      @edit-node="onEditNode"
      @create-method="onCreateMethod"
      @edit-method="onEditMethod"
      @create-model="onCreateModel"
      @edit-model="onEditModel"
      @click-recompute="onClickRecompute"
    />
    <template v-else>
      <VMenusFlat
        v-if="(node !== null)
          && (menu !== undefined)
          && (menu.hierarchy === undefined)"
        style="height: 100%; width: 100%;"
        :title="menuTitle"
        :menus-config="menu.entries"
        :selected-options="selectedOptions"
        @click-menu-option="onClickMenuOption"
      />
      <VMenusGrouped
        v-else-if="(node !== null)
          && (menu !== undefined)
          && (menu.hierarchy !== undefined)"
        style="height: 100%; width: 100%;"
        :title="menuTitle"
        :menus-config="menu.entries"
        :menu-tree="menu.hierarchy"
        :selected-options="selectedOptions"
        @click-menu-option="onClickMenuOption"
      />
      <v-card
        v-else
        tile
        style="height: 100%; width: 100%;"
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
          {{ 'Element Setting' }}
        </v-card-title>
        <v-divider />
        <v-card-actions style="height: calc(100% - 30px)">
          <p class="mx-auto subtitle-1">
            No Workflow Element Selected
          </p>
        </v-card-actions>
      </v-card>
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapState } from 'vuex';
import {
  LabelTaskType,
  TaskTransformationType,
  StoppageAnalysisType,
  FeatureExtractionMethod,
  ModelService,
} from '@/commons/types';
import VMenusFlat from './VMenusFlat.vue';
import VMenusGrouped from './VMenusGrouped.vue';
import TheNodeDetailsDataObjectSelection from './TheNodeDetailsDataObjectSelection.vue';
import TheNodeDetailsDefaultLabeling from './TheNodeDetailsDefaultLabeling.vue';
import TheNodeDetailsFeatureExtraction from './TheNodeDetailsFeatureExtraction.vue';
import TheNodeDetailsInteractiveLabeling from './TheNodeDetailsInteractiveLabeling.vue';
import TheNodeDetailsInterimModelTraining from './TheNodeDetailsInterimModelTraining.vue';
import { WorkflowNode, NodeTypes } from './types';

const menuMapper = {
  [NodeTypes.LabelTask]: {
    entries: {
      enableClassification: {
        title: 'Classification',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
      enableObjectDetection: {
        title: 'Object Detection',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
      enableSegmentation: {
        title: 'Segmentation',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
    },
  },
  [NodeTypes.DataType]: undefined,
  [NodeTypes.LabelIdeation]: undefined,
  [NodeTypes.TaskTransformation]: {
    entries: {
      method: {
        title: 'Method',
        options: [TaskTransformationType.DirectLabeling],
        optionsText: ['Direct Labeling'],
      },
    },
  },
  [NodeTypes.StoppageAnalysis]: {
    entries: {
      method: {
        title: 'Method',
        options: [StoppageAnalysisType.AllChecked],
        optionsText: ['All Checked'],
      },
    },
  },
  [NodeTypes.QualityAssurance]: undefined,
  [NodeTypes.Decision]: undefined,
  [NodeTypes.Initialization]: undefined,
  [NodeTypes.Terminal]: undefined,
};

const menuTitleMapper: Record<NodeTypes, string> = {
  [NodeTypes.LabelTask]: 'Label Task Setting',
  [NodeTypes.DataType]: 'Data Type Setting',
  [NodeTypes.LabelIdeation]: 'Label Ideation Instantiation',
  [NodeTypes.FeatureExtraction]: 'Feature Extraction Instantiation',
  [NodeTypes.DataObjectSelection]: 'Data Object Selection Instantiation',
  [NodeTypes.DefaultLabeling]: 'Default Labeling Instantiation',
  [NodeTypes.TaskTransformation]: 'Task Transformation Instantiation',
  [NodeTypes.InteractiveLabeling]: 'Interactive Labeling Instantiation',
  [NodeTypes.StoppageAnalysis]: 'Stoppage Analysis Instantiation',
  [NodeTypes.InterimModelTraining]: 'Interim Model Training Instantiation',
  [NodeTypes.QualityAssurance]: 'Quality Assurance Instantiation',
  [NodeTypes.Decision]: 'Decision Criteria',
  [NodeTypes.Initialization]: 'Initialization Setting',
  [NodeTypes.Terminal]: 'Terminal',
};

export default Vue.extend({
  name: 'TheNodeDetails',
  components: {
    VMenusFlat,
    VMenusGrouped,
    TheNodeDetailsDataObjectSelection,
    TheNodeDetailsDefaultLabeling,
    TheNodeDetailsFeatureExtraction,
    TheNodeDetailsInteractiveLabeling,
    TheNodeDetailsInterimModelTraining,
  },
  props: {
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      NodeTypes,
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
    ]),
    menuTitle(): string {
      const { type } = this.node;
      return menuTitleMapper[type];
    },
    menu() {
      const { type } = this.node;
      return menuMapper[type];
    },
    selectedOptions() {
      const { node } = this;
      if (node.type === NodeTypes.LabelTask) {
        const enableClassification = node.value
          .findIndex((d) => d === LabelTaskType.Classification) >= 0;
        const enableObjectDetection = node.value
          .findIndex((d) => d === LabelTaskType.ObjectDetection) >= 0;
        const enableSegmentation = node.value
          .findIndex((d) => d === LabelTaskType.Segmentation) >= 0;
        return {
          enableClassification,
          enableObjectDetection,
          enableSegmentation,
        };
      }
      return node.value;
    },
  },
  methods: {
    onClickMenuOption(menuKey: string, option: unknown): void {
      const { node } = this;

      if (node.type === NodeTypes.LabelTask) {
        let labelTasks = [...(node.value as LabelTaskType[])];
        const clickedLabelTask = {
          enableClassification: LabelTaskType.Classification,
          enableObjectDetection: LabelTaskType.ObjectDetection,
          enableSegmentation: LabelTaskType.Segmentation,
        }[menuKey] as LabelTaskType;
        const idx = labelTasks.findIndex((d) => d === clickedLabelTask);
        if (option === true && !(idx >= 0)) {
          labelTasks = [...labelTasks, clickedLabelTask];
        } else if (option === false && idx >= 0) {
          labelTasks.splice(idx, 1);
        }
        this.onSetNodeValue(node, labelTasks);
      }

      if (node.type === NodeTypes.FeatureExtraction
        || node.type === NodeTypes.DataObjectSelection
        || node.type === NodeTypes.DefaultLabeling
        || node.type === NodeTypes.InteractiveLabeling
        || node.type === NodeTypes.InterimModelTraining
      ) {
        this.onSetNodeValue(node, {
          ...node.value,
          ...{ [menuKey]: option },
        });
      }
    },
    onSetNodeValue(node: WorkflowNode, value: unknown): void {
      this.$emit('set-node-value', node, value);
    },
    onEditNode(newValue: WorkflowNode): void {
      this.$emit('edit-node', newValue);
    },
    onEditMethod(nodeType: NodeTypes, newValue: FeatureExtractionMethod): void {
      this.$emit('edit-method', nodeType, newValue);
    },
    onCreateMethod(): void {
      this.$emit('create-method', this.node.type);
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit-model', newValue);
    },
    onCreateModel(): void {
      this.$emit('create-model');
    },
    onClickRecompute(node: WorkflowNode): void {
      this.$emit('click-recompute', node);
    },
  },
});
</script>
