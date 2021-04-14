<template>
  <!-- The process parameter panel. -->
  <v-container
    class="pa-0"
    fill-height
  >
    <TheNodeParameterViewFeatureExtraction
      v-if="(node !== null)
       && (node.type === NodeTypes.featureExtraction)"
      :methods="featureExtractionMethods"
      :node="node"
      @create-option="onCreateOption"
      @edit-node="onEditNode"
      @edit-method="onEditMethod"
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
  DefaultLabelingMethodType,
  SamplingStrategyType,
  TaskTransformationType,
  StoppageAnalysisType,
  InterimModelTrainingType,
  FeatureExtractionMethod,
} from '@/commons/types';
import VMenusFlat from './VMenusFlat.vue';
import VMenusGrouped from './VMenusGrouped.vue';
import TheNodeParameterViewFeatureExtraction from './TheNodeParameterViewFeatureExtraction.vue';
import { WorkflowNode, NodeTypes } from './types';

const menuMapper = {
  [NodeTypes.labelTask]: {
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
  [NodeTypes.dataType]: undefined,
  [NodeTypes.labelIdeation]: undefined,
  [NodeTypes.dataObjectSelection]: {
    entries: {
      strategy: {
        title: 'Strategy',
        options: [
          SamplingStrategyType.Random,
          SamplingStrategyType.Cluster,
          SamplingStrategyType.DenseAreas,
          SamplingStrategyType.ClusterCentroids,
          SamplingStrategyType.Entropy,
          SamplingStrategyType.LeastConfident,
          SamplingStrategyType.SmallestMargin,
        ],
        optionsText: [
          'Random',
          'Cluster',
          'Dense Areas',
          'Cluster Centroids',
          'Entropy',
          'Least Confident',
          'Smallest Margin',
        ],
      },
      nBatch: {
        title: 'Selection Batch Size',
        options: [1, 4, 16, 32, 48, 64, 96],
        optionsText: ['1', '4', '16', '32', '48', '64', '96'],
      },
      projectionAidEnabled: {
        title: 'Projection Support Enabled',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
    },
    hierarchy: {
      algorithmicSampling: {
        title: 'Algorithmic Sampling',
        menuKeys: ['strategy', 'nBatch'],
      },
      userSampling: {
        title: 'User Sampling',
        menuKeys: ['projectionAidEnabled'],
      },
    },
  },
  [NodeTypes.defaultLabeling]: {
    entries: {
      method: {
        title: 'Labeling Model',
        options: [
          DefaultLabelingMethodType.Null,
          DefaultLabelingMethodType.Random,
          DefaultLabelingMethodType.DecisionTree,
          DefaultLabelingMethodType.SVM,
          DefaultLabelingMethodType.LogisticRegression,
          DefaultLabelingMethodType.LabelSpreading,
          DefaultLabelingMethodType.RestrictedBoltzmannMachine,
        ],
        optionsText: [
          'Null',
          'Random',
          'Decision Tree',
          'SVM',
          'Logistic Regression',
          'Label Spreading',
          'Restricted Boltzmann Machine',
        ],
      },
    },
  },
  [NodeTypes.taskTransformation]: {
    entries: {
      method: {
        title: 'Method',
        options: [TaskTransformationType.DirectLabeling],
        optionsText: ['Direct Labeling'],
      },
    },
  },
  [NodeTypes.interactiveLabeling]: {
    entries: {
      singleObjectDisplayEnabled: {
        title: 'Enabled',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
      gridMatrixEnabled: {
        title: 'Enabled',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
      itemsPerRow: {
        title: 'Data Objects Per Row',
        options: [1, 4, 8, 12],
        optionsText: ['1', '4', '8', '12'],
      },
      itemsPerCol: {
        title: 'Data Objects Per Column',
        options: [1, 2, 4, 6, 8],
        optionsText: ['1', '2', '4', '6', '8'],
      },
    },
    hierarchy: {
      singleObjectDisplay: {
        title: 'Single Object Display',
        menuKeys: ['singleObjectDisplayEnabled'],
      },
      gridMatrix: {
        title: 'GridMatrix',
        menuKeys: ['gridMatrixEnabled', 'itemsPerRow', 'itemsPerCol'],
      },
    },
  },
  [NodeTypes.stoppageAnalysis]: {
    entries: {
      method: {
        title: 'Method',
        options: [StoppageAnalysisType.AllChecked],
        optionsText: ['All Checked'],
      },
    },
  },
  [NodeTypes.interimModelTraining]: {
    entries: {
      enabled: {
        title: 'Enabled',
        options: [false, true],
        optionsText: ['No', 'Yes'],
      },
      method: {
        title: 'Method',
        options: [InterimModelTrainingType.Retrain],
        optionsText: ['Retrain'],
      },
    },
  },
  [NodeTypes.qualityAssurance]: undefined,
  [NodeTypes.decision]: undefined,
  [NodeTypes.initialization]: undefined,
  [NodeTypes.terminal]: undefined,
};

const menuTitleMapper: Record<NodeTypes, string> = {
  [NodeTypes.labelTask]: 'Label Task Setting',
  [NodeTypes.dataType]: 'Data Type Setting',
  [NodeTypes.labelIdeation]: 'Label Ideation Instantiation',
  [NodeTypes.featureExtraction]: 'Feature Extraction Instantiation',
  [NodeTypes.dataObjectSelection]: 'Data Object Selection Instantiation',
  [NodeTypes.defaultLabeling]: 'Default Labeling Instantiation',
  [NodeTypes.taskTransformation]: 'Task Transformation Instantiation',
  [NodeTypes.interactiveLabeling]: 'Interactive Labeling Instantiation',
  [NodeTypes.stoppageAnalysis]: 'Stoppage Analysis Instantiation',
  [NodeTypes.interimModelTraining]: 'Interim Model Training Instantiation',
  [NodeTypes.qualityAssurance]: 'Quality Assurance Instantiation',
  [NodeTypes.decision]: 'Decision Criteria',
  [NodeTypes.initialization]: 'Initialization Setting',
  [NodeTypes.terminal]: 'Terminal',
};

export default Vue.extend({
  name: 'TheNavBarViewDialogGraphView',
  components: {
    VMenusFlat,
    VMenusGrouped,
    TheNodeParameterViewFeatureExtraction,
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      default: null,
    },
  },
  data() {
    return {
      NodeTypes,
    };
  },
  computed: {
    ...mapState('workflow', ['featureExtractionMethods']),
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
      if (node.type === NodeTypes.labelTask) {
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

      if (node.type === NodeTypes.labelTask) {
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

      if (node.type === NodeTypes.featureExtraction
        || node.type === NodeTypes.dataObjectSelection
        || node.type === NodeTypes.defaultLabeling
        || node.type === NodeTypes.interactiveLabeling
        || node.type === NodeTypes.interimModelTraining
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
    onEditMethod(newValue: FeatureExtractionMethod): void {
      this.$emit('edit-method', newValue);
    },
    onCreateOption(): void {
      // pass
      this.$emit('create-option', this.node.type);
    },
    onClickRecompute(node: WorkflowNode): void {
      this.$emit('click-recompute', node);
    },
  },
});
</script>
