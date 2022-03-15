<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-menu
    :close-on-content-click="false"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        :elevation="0"
        title="Configure Feature Space"
        x-small
        icon
        tile
        v-on="on"
      >
        <v-icon
          class="px-0"
          color="black"
          small
        >
          $vuetify.icons.values.data
        </v-icon>
      </v-btn>
    </template>
    <div :style="style.cardElevated">
      <div
        :style="style.cardHeader"
        class="px-2"
      >
        Feature Space Configuration
      </div>
      <v-divider />
      <div
        class="pa-2"
        style="display: flex; flex-direction: column; gap: 8px;"
      >
        <!-- The buttons for resetting feature selection. -->
        <div style="display: flex; flex-direction: row;">
          <!-- The select all features button. -->
          <v-btn
            class="card-header-button subtitle-2 mr-2"
            title="Select All Features"
            x-small
            @click="onClickSelectAllFeatures"
          >
            Select All
          </v-btn>
          <!-- The unselect all features button. -->
          <v-btn
            class="card-header-button subtitle-2"
            title="Clear Feature Selection"
            x-small
            @click="$emit('update:feature-indices', [])"
          >
            Clear Selection
          </v-btn>
        </div>

        <!-- The input box for single feature selection. -->
        <v-autocomplete
          :items="featureNames"
          label="Search Feature"
          dense
          hide-details
        >
          <template #item="data">
            <v-checkbox
              :label="data.item"
              :value="selectedFeatureNames.findIndex((d) => d === data.item) >= 0"
              :input-value="selectedFeatureNames.findIndex((d) => d === data.item) >= 0"
              class="pa-0 ma-0"
              dense
              hide-details
              @click.stop
              @change="onClickCheckbox(data.item)"
            />
          </template>
        </v-autocomplete>

        <!-- The selected feature number. -->
        <div>
          {{ `${selectedFeatureIndices.length} / ${featureNames.length} features selected` }}
        </div>
      </div>
    </div>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { cardElevated, cardHeader } from '@/style';

export default defineComponent({
  name: 'TheBodyToolsFeatureMenu',
  props: {
    featureNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    selectedFeatureIndices: {
      type: Array as PropType<number[]>,
      required: true,
    },
  },
  emits: {
    'update:feature-indices': null,
  },
  data() {
    return {
      style: { cardElevated, cardHeader },
    };
  },
  computed: {
    selectedFeatureNames(): string[] {
      const { selectedFeatureIndices, featureNames } = this;
      return selectedFeatureIndices.map((d) => featureNames[d]);
    },
  },
  methods: {
    onClickSelectAllFeatures(): void {
      const { featureNames } = this;
      const nFeatures = featureNames.length;
      const selectedFeatureIndices = new Array(nFeatures).fill(null).map((d, i) => i);
      this.$emit('update:feature-indices', selectedFeatureIndices);
    },
    onClickCheckbox(featureName: string): void {
      const featureIndex = this.featureNames.findIndex((d) => d === featureName);
      const featureIndexIndex = this.selectedFeatureIndices.findIndex((d) => d === featureIndex);
      const wasSelected = featureIndexIndex >= 0;
      const selectedFeatureIndices = wasSelected
        ? [
          ...this.selectedFeatureIndices.slice(0, featureIndexIndex),
          ...this.selectedFeatureIndices.slice(featureIndexIndex + 1),
        ]
        : [...this.selectedFeatureIndices, featureIndex];
      this.$emit('update:feature-indices', selectedFeatureIndices);
    },
  },
});
</script>
