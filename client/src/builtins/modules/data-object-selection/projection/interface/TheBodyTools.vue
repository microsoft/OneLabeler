<template>
  <!-- set position absolute to allow
    the header buttons to overlap with the chart. -->
  <div style="position: absolute">
    <!-- The feature space configuration menu. -->
    <TheBodyToolsFeatureMenu
      :feature-names="featureNames"
      :selected-feature-indices="selectedFeatureIndices"
      :projection-method="projectionMethod"
      @update:feature-indices="$emit('update:feature-indices', $event)"
      @update:projection-method="$emit('update:projection-method', $event)"
    />

    <!-- The binning configuration menu. -->
    <TheBodyToolsBinningMenu
      :enable-binning="enableBinning"
      :binning-n-rows="binningNRows"
      :binning-n-columns="binningNColumns"
      @update:binning="$emit('update:binning', $event)"
    />

    <!-- The enable subsampling menu. -->
    <TheBodyToolsSubsamplingMenu
      :enable-subsampling="enableSubsampling"
      :subsampling-n-samples="subsamplingNSamples"
      @update:subsampling="$emit('update:subsampling', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { ProjectionMethodType } from '@/commons/types';
import TheBodyToolsFeatureMenu from './TheBodyToolsFeatureMenu.vue';
import TheBodyToolsBinningMenu from './TheBodyToolsBinningMenu.vue';
import TheBodyToolsSubsamplingMenu from './TheBodyToolsSubsamplingMenu.vue';

export default defineComponent({
  name: 'TheBodyTools',
  components: {
    TheBodyToolsFeatureMenu,
    TheBodyToolsBinningMenu,
    TheBodyToolsSubsamplingMenu,
  },
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
  emits: {
    'update:feature-indices': null,
    'update:projection-method': null,
    'update:binning': null,
    'update:subsampling': null,
  },
});
</script>
