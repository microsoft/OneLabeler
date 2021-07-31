<template>
  <!-- set position absolute to allow
    the header buttons to overlap with projection points. -->
  <div style="position: absolute">
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
        <div class="view-header px-2">
          Feature Space Configuration
        </div>
        <v-card>
          <v-list
            style="width: 100%"
            class="px-2"
            dense
            subheader
          >
            <!-- The buttons for reseting feature selection. -->
            <div
              class="py-2"
              style="display: flex; flex-direction: row;"
            >
              <!-- The select all features button. -->
              <v-btn
                class="view-header-button subtitle-2 mr-2"
                title="Select All Features"
                x-small
                @click="onClickSelectAllFeatures"
              >
                Select All
              </v-btn>
              <!-- The unselect all features button. -->
              <v-btn
                class="view-header-button subtitle-2"
                title="Clear Feature Selection"
                x-small
                @click="onClickUnselectAllFeatures"
              >
                Clear Selection
              </v-btn>
            </div>

            <!-- The input box for single feature selection. -->
            <v-autocomplete
              v-model="singleFeatureNameModel"
              :items="featureNames"
              label="Search Feature"
              dense
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

            <!-- The set projection method menu. -->
            <div
              class="pt-2"
              style="display: flex; flex-direction: row; align-items: center;"
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
                    class="subtitle-2"
                    style="min-height: 30px"
                    @click="onClickProjectionMethod(option, i)"
                  >
                    {{ projectionMethodMenu.optionsText[i] }}
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-list>
        </v-card>
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
        <div class="view-header px-2">
          Binning Configuration
        </div>
        <v-card>
          <v-list class="px-2 pt-0">
            <div
              class="pt-1"
              style="display: flex; flex-direction: row; align-items: center;"
            >
              <div style="width: 100%">
                Enable Binning
              </div>
              <v-switch
                class="pa-0 pl-2 ma-0"
                :value="enableBinning"
                :ripple="false"
                hide-details
                dense
                @change="onClickEnableBinning($event)"
              />
            </div>
            <div
              class="pt-1"
              style="display: flex; flex-direction: row; align-items: center;"
            >
              <div style="width: 100%">
                #Rows
              </div>
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
            </div>
            <div
              class="pt-1"
              style="display: flex; flex-direction: row; align-items: center;"
            >
              <div style="width: 100%">
                #Columns
              </div>
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
            </div>
          </v-list>
        </v-card>
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
        <div class="view-header px-2">
          Subsampling Configuration
        </div>
        <v-card>
          <v-list class="px-2 pt-0">
            <div
              class="pt-1"
              style="display: flex; flex-direction: row; align-items: center;"
            >
              <div style="width: 100%">
                Enable Subsampling
              </div>
              <v-switch
                class="pa-0 pl-2 ma-0"
                :value="enableSubsampling"
                :ripple="false"
                hide-details
                dense
                @change="onClickEnableSubsampling($event)"
              />
            </div>
            <div
              class="pt-1"
              style="display: flex; flex-direction: row; align-items: center;"
            >
              <div style="width: 100%">
                #Samples
              </div>
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
            </div>
          </v-list>
        </v-card>
      </v-card>
    </v-menu>
  </div>
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
  data() {
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
      } as { options: ProjectionMethodType[], optionsText: string[] },
      singleFeatureNameModel: null as string | null,
      binningNRowsRange: [5, 50] as [number, number],
      binningNColumnsRange: [5, 50] as [number, number],
      subsamplingNSamplesRange: [50, 500] as [number, number],
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
      this.$emit('click:projection-method', projectionMethod);
    },
    onClickSelectAllFeatures() {
      const { featureNames } = this;
      const nFeatures = featureNames.length;
      const selectedFeatureIndices = new Array(nFeatures).fill(null).map((d, i) => i);
      this.$emit('update:feature-indices', selectedFeatureIndices);
    },
    onClickUnselectAllFeatures() {
      this.$emit('update:feature-indices', []);
    },
    onAddSingleFeature(featureName: string) {
      const featureIndex = this.featureNames.findIndex((d) => d === featureName);
      const selectedFeatureIndices = [...this.selectedFeatureIndices, featureIndex];
      this.$emit('update:feature-indices', selectedFeatureIndices);
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
        this.$emit('update:feature-indices', selectedFeatureIndices);
      } else {
        const selectedFeatureIndices = [...this.selectedFeatureIndices, featureIndex];
        this.$emit('update:feature-indices', selectedFeatureIndices);
      }
    },
    onClickEnableBinning(enabled: (true | null)) {
      const { binningNRows, binningNColumns } = this;
      const binningUpdated = {
        enabled: enabled === true,
        nRows: binningNRows,
        nColumns: binningNColumns,
      };
      this.$emit('update:binning', binningUpdated);
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
      this.$emit('update:binning', binningUpdated);
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
      this.$emit('update:binning', binningUpdated);
    },
    onClickEnableSubsampling(enabled: (true | null)) {
      const { subsamplingNSamples } = this;
      const subsamplingUpdated = {
        enabled: enabled === true,
        nSamples: subsamplingNSamples,
      };
      this.$emit('update:subsampling', subsamplingUpdated);
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
      this.$emit('update:subsampling', subsamplingUpdated);
    },
  },
});
</script>
