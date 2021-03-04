<template>
  <v-card-title
    class="pt-1 pl-1"
    style="position: absolute;"
  >
    <!-- The feature space configuration menu. -->
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
      <v-card>
        <v-container class="pa-0">
          <v-card-title class="view-header">
            <v-container class="px-2 py-0">
              Feature Space Configuration
            </v-container>
          </v-card-title>
          <v-card>
            <v-list
              style="width: 100%"
              dense
              subheader
            >
              <!-- The buttons for reseting feature selection. -->
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <!-- The select all features button. -->
                <v-btn
                  class="view-header-button subtitle-2 pr-2"
                  title="Select All Features"
                  x-small
                  @click="onClickSelectAllFeatures"
                >
                  Select All
                </v-btn>
                <v-spacer />
                <!-- The unselect all features button. -->
                <v-btn
                  class="view-header-button subtitle-2"
                  title="Clear Feature Selection"
                  x-small
                  @click="onClickUnselectAllFeatures"
                >
                  Clear Selection
                </v-btn>
              </v-list-item>

              <!-- The input box for single feature selection. -->
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <v-autocomplete
                  v-model="singleFeatureNameModel"
                  :items="featureNames"
                  label="Search Feature"
                  dense
                >
                  <template #item="data">
                    <v-list-item-content
                      dense
                      @click.stop
                    >
                      <v-checkbox
                        :label="data.item"
                        :value="selectedFeatureNames.findIndex((d) => d === data.item) >= 0"
                        :input-value="selectedFeatureNames.findIndex((d) => d === data.item) >= 0"
                        class="pa-0 ma-0"
                        dense
                        hide-details
                        @change="onClickCheckbox(data.item)"
                      />
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-list-item>

              <!-- The selected feature list. -->
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                {{ `${selectedFeatureIndices.length} / ${featureNames.length} features selected` }}
              </v-list-item>

              <!-- The set projection method menu. -->
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                Projection Method
                <v-spacer />
                <v-menu offset-y>
                  <template #activator="{ on }">
                    <v-btn
                      :disabled="disableProjectionMethodMenu"
                      class="view-header-button subtitle-2"
                      width="60"
                      x-small
                      v-on="on"
                    >
                      {{ projectionMethod }}
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item
                      v-for="(option, i) in projectionMethodMenu.options"
                      :key="i"
                      style="min-height: 30px"
                      @click="onClickProjectionMethod(option, i)"
                    >
                      <v-list-item-title
                        height="20"
                        class="subtitle-2 pa-0 ma-0"
                        style="height: 20px"
                      >
                        {{ projectionMethodMenu.optionsText[i] }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>
            </v-list>
          </v-card>
        </v-container>
      </v-card>
    </v-menu>

    <!-- The binning configuration menu. -->
    <v-menu
      offset-y
      :close-on-content-click="false"
    >
      <template #activator="{ on }">
        <v-btn
          title="Binning Configuration"
          :elevation="0"
          x-small
          icon
          v-on="on"
        >
          <v-icon
            aria-hidden="true"
            color="black"
            small
          >
            $vuetify.icons.values.matrix
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-container class="pa-0">
          <v-card-title class="view-header">
            <v-container class="px-2 py-0">
              Binning Configuration
            </v-container>
          </v-card-title>
          <v-card>
            <v-list
              style="width: 100%"
              dense
              subheader
            >
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <v-container class="pa-0 pr-2">
                  Enable Binning
                </v-container>
                <v-switch
                  class="pa-0 ma-0"
                  :value="enableBinning"
                  :ripple="false"
                  hide-details
                  dense
                  @change="onClickEnableBinning($event)"
                />
              </v-list-item>
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <v-container class="pa-0">
                  #Rows
                </v-container>
                <v-text-field
                  :value="binningNRows"
                  :disabled="!enableBinning"
                  :rules="[
                    (x) =>
                      x >= binningNRowsRange[0] &&
                      x <= binningNRowsRange[1],
                  ]"
                  :min="binningNRowsRange[0]"
                  :max="binningNRowsRange[1]"
                  class="ma-0 pa-0"
                  type="number"
                  style="width: 60px"
                  dense
                  hide-details
                  single-line
                  @input="onInputBinningNRows(+$event)"
                />
              </v-list-item>
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <v-container class="pa-0">
                  #Columns
                </v-container>
                <v-text-field
                  :value="binningNColumns"
                  :disabled="!enableBinning"
                  :rules="[
                    (x) =>
                      x >= binningNColumnsRange[0] &&
                      x <= binningNColumnsRange[1],
                  ]"
                  :min="binningNColumnsRange[0]"
                  :max="binningNColumnsRange[1]"
                  class="ma-0 pa-0"
                  dense
                  hide-details
                  single-line
                  type="number"
                  style="width: 60px"
                  @input="onInputBinningNColumns(+$event)"
                />
              </v-list-item>
            </v-list>
          </v-card>
        </v-container>
      </v-card>
    </v-menu>

    <!-- The enable subsampling menu. -->
    <v-menu
      offset-y
      :close-on-content-click="false"
    >
      <template #activator="{ on }">
        <v-btn
          title="Subsampling Configuration"
          :elevation="0"
          x-small
          icon
          v-on="on"
        >
          <v-icon
            aria-hidden="true"
            color="black"
            small
          >
            $vuetify.icons.values.filter
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-container class="pa-0">
          <v-card-title class="view-header">
            <v-container class="px-2 py-0">
              Subsampling Configuration
            </v-container>
          </v-card-title>
          <v-card>
            <v-list
              style="width: 100%"
              dense
              subheader
            >
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <v-container class="pa-0 pr-2">
                  Enable Subsampling
                </v-container>
                <v-switch
                  class="pa-0 ma-0"
                  :value="enableSubsampling"
                  :ripple="false"
                  hide-details
                  dense
                  @change="onClickEnableSubsampling($event)"
                />
              </v-list-item>
              <v-list-item
                class="list-group-item d-flex justify-content-between align-items-center py-0 px-2"
              >
                <v-container class="pa-0">
                  #Samples
                </v-container>
                <v-text-field
                  :value="subsamplingNSamples"
                  :disabled="!enableSubsampling"
                  :rules="[
                    (x) =>
                      x >= subsamplingNSamplesRange[0] &&
                      x <= subsamplingNSamplesRange[1],
                  ]"
                  :min="subsamplingNSamplesRange[0]"
                  :max="subsamplingNSamplesRange[1]"
                  class="ma-0 pa-0"
                  type="number"
                  style="width: 60px"
                  dense
                  hide-details
                  single-line
                  @input="onInputSubsamplingNSamples(+$event)"
                />
              </v-list-item>
            </v-list>
          </v-card>
        </v-container>
      </v-card>
    </v-menu>
  </v-card-title>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ProjectionMethodType } from '@/commons/types';

export default Vue.extend({
  name: 'VConfigurableProjectionHeader',
  props: {
    featureNames: {
      type: Array as PropType<string[]>,
      required: true,
    },
    selectedFeatureIndices: {
      type: Array as PropType<number[]>,
      required: true,
    },
    projectionMethod: {
      type: String as PropType<ProjectionMethodType>,
      required: true,
    },
    enableBinning: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    binningNRows: {
      type: Number as PropType<number>,
      required: true,
    },
    binningNColumns: {
      type: Number as PropType<number>,
      required: true,
    },
    enableSubsampling: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    subsamplingNSamples: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  data(): {
    projectionMethodMenu: { options: ProjectionMethodType[], optionsText: string[] },
    singleFeatureNameModel: string | null,
    binningNRowsRange: [number, number],
    binningNColumnsRange: [number, number],
    subsamplingNSamplesRange: [number, number],
    } {
    return {
      projectionMethodMenu: {
        options: [
          ProjectionMethodType.PCA,
          ProjectionMethodType.MDS,
          ProjectionMethodType.TSNE,
        ],
        optionsText: [
          ProjectionMethodType.PCA,
          ProjectionMethodType.MDS,
          ProjectionMethodType.TSNE,
        ],
      },
      singleFeatureNameModel: null,
      binningNRowsRange: [5, 50],
      binningNColumnsRange: [5, 50],
      subsamplingNSamplesRange: [50, 500],
    };
  },
  computed: {
    disableSingleFeatureNameAddition(): boolean {
      if (this.singleFeatureNameModel === null) {
        return true;
      }
      return !(this.featureNames.findIndex((d) => d === this.singleFeatureNameModel) >= 0);
    },
    disableProjectionMethodMenu(): boolean {
      const { selectedFeatureIndices } = this;
      return selectedFeatureIndices.length <= 2;
    },
    selectedFeatureNames(): string[] {
      const { selectedFeatureIndices, featureNames } = this;
      return selectedFeatureIndices.map((d) => featureNames[d]);
    },
  },
  methods: {
    onClickProjectionMethod(projectionMethod: ProjectionMethodType) {
      this.$emit('click-projection-method', projectionMethod);
    },
    onClickSelectAllFeatures() {
      const { featureNames } = this;
      const nFeatures = featureNames.length;
      const selectedFeatureIndices = new Array(nFeatures).fill(null).map((d, i) => i);
      this.$emit('update-selected-feature-indices', selectedFeatureIndices);
    },
    onClickUnselectAllFeatures() {
      this.$emit('update-selected-feature-indices', []);
    },
    onAddSingleFeature(featureName: string) {
      const featureIndex = this.featureNames.findIndex((d) => d === featureName);
      const selectedFeatureIndices = [...this.selectedFeatureIndices, featureIndex];
      this.$emit('update-selected-feature-indices', selectedFeatureIndices);
      this.singleFeatureNameModel = null;
    },
    onClickCheckbox(featureName: string) {
      const featureIndex = this.featureNames.findIndex((d) => d === featureName);
      const featureIndexIndex = this.selectedFeatureIndices.findIndex((d) => d === featureIndex);
      const wasSelected = featureIndexIndex >= 0;
      if (wasSelected) {
        const selectedFeatureIndices = [
          ...this.selectedFeatureIndices.slice(0, featureIndexIndex),
          ...this.selectedFeatureIndices.slice(featureIndexIndex + 1),
        ];
        this.$emit('update-selected-feature-indices', selectedFeatureIndices);
      } else {
        const selectedFeatureIndices = [...this.selectedFeatureIndices, featureIndex];
        this.$emit('update-selected-feature-indices', selectedFeatureIndices);
      }
    },
    onClickEnableBinning(enabled: (true | null)) {
      const { binningNRows, binningNColumns } = this;
      const binningUpdated = {
        enabled: enabled === true,
        nRows: binningNRows,
        nColumns: binningNColumns,
      };
      this.$emit('update-binning', binningUpdated);
    },
    onInputBinningNRows(nRows: number) {
      const { binningNRowsRange, enableBinning, binningNColumns } = this;
      if (nRows < binningNRowsRange[0] || nRows > binningNRowsRange[1]) {
        return;
      }
      const binningUpdated = {
        enabled: enableBinning,
        nRows,
        nColumns: binningNColumns,
      };
      this.$emit('update-binning', binningUpdated);
    },
    onInputBinningNColumns(nColumns: number) {
      const { binningNColumnsRange, enableBinning, binningNRows } = this;
      if (nColumns < binningNColumnsRange[0] || nColumns > binningNColumnsRange[1]) {
        return;
      }
      const binningUpdated = {
        enabled: enableBinning,
        nRows: binningNRows,
        nColumns,
      };
      this.$emit('update-binning', binningUpdated);
    },
    onClickEnableSubsampling(enabled: (true | null)) {
      const { subsamplingNSamples } = this;
      const subsamplingUpdated = {
        enabled: enabled === true,
        nSamples: subsamplingNSamples,
      };
      this.$emit('update-subsampling', subsamplingUpdated);
    },
    onInputSubsamplingNSamples(nSamples: number) {
      const { enableSubsampling, subsamplingNSamplesRange } = this;
      if (nSamples < subsamplingNSamplesRange[0] || nSamples > subsamplingNSamplesRange[1]) {
        return;
      }
      const subsamplingUpdated = {
        enabled: enableSubsampling,
        nSamples,
      };
      this.$emit('update-subsampling', subsamplingUpdated);
    },
  },
});
</script>
