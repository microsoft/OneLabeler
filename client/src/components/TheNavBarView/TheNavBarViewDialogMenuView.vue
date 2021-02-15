<template>
  <!-- The configuration menus. -->
  <v-container class="pa-0">
    <VMenusFlat
      :title="'Workflow Parameters'"
      :menus-config="menusConfig"
      :selected-options="settings"
      @click-menu-option="onClickMenuOption"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import {
  DefaultLabelingMethodType,
  SamplingStrategyType,
} from '@/commons/types';
import VMenusFlat from './VMenusFlat.vue';

const menusConfig: {
  [key: string]: {
    title: string;
    options: unknown[];
    optionsText: string[];
  }
} = {
  samplingStrategy: {
    title: 'Sampling Strategy',
    options: [
      SamplingStrategyType.Random,
      SamplingStrategyType.ClusterCentroids,
      SamplingStrategyType.DenseAreas,
      SamplingStrategyType.Entropy,
      SamplingStrategyType.LeastConfident,
      SamplingStrategyType.SmallestMargin,
    ],
    optionsText: [
      'Random',
      'Cluster Centroids',
      'Dense Areas',
      'Entropy',
      'Least Confident',
      'Smallest Margin',
    ],
  },
  nBatch: {
    title: 'Data Objects Per Sampled Batch',
    options: [1, 4, 16, 32, 48, 64, 96],
    optionsText: ['1', '4', '16', '32', '48', '64', '96'],
  },
  defaultLabelingMethod: {
    title: 'Default Labeling Model',
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
  showDatasetOverview: {
    title: 'Show Dataset Overview',
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
};

export default Vue.extend({
  name: 'TheNavBarViewDialogMenuView',
  components: {
    VMenusFlat,
  },
  data() {
    return { menusConfig };
  },
  computed: {
    ...mapState('workflow', [
      'samplingStrategy',
      'showDatasetOverview',
      'defaultLabelingMethod',
      'nBatch',
      'itemsPerRow',
      'itemsPerCol',
    ]),
    settings() {
      const {
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      } = this;
      return {
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      };
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setSamplingStrategy',
      'setNBatch',
      'setDefaultLabelingMethod',
      'setShowDatasetOverview',
      'setItemsPerRow',
      'setItemsPerCol',
    ]),
    onClickMenuOption(menuKey: string, option: unknown): void {
      if (menuKey === 'samplingStrategy') {
        this.setSamplingStrategy(option as SamplingStrategyType);
      }
      if (menuKey === 'nBatch') {
        this.setNBatch(option as number);
      }
      if (menuKey === 'defaultLabelingMethod') {
        this.setDefaultLabelingMethod(option as DefaultLabelingMethodType);
      }
      if (menuKey === 'showDatasetOverview') {
        this.setShowDatasetOverview(option as boolean);
      }
      if (menuKey === 'itemsPerRow') {
        this.setItemsPerRow(option as number);
      }
      if (menuKey === 'itemsPerCol') {
        this.setItemsPerCol(option as number);
      }
    },
  },
});
</script>
