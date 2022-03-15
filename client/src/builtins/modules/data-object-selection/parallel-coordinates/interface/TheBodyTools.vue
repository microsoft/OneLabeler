<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <!-- set position absolute to allow
    the header buttons to overlap with the chart. -->
  <div style="position: absolute">
    <!-- The feature space configuration menu. -->
    <TheBodyToolsFeatureMenu
      :feature-names="featureNames"
      :selected-feature-indices="selectedFeatureIndices"
      @update:feature-indices="$emit('update:feature-indices', $event)"
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
import TheBodyToolsFeatureMenu from './TheBodyToolsFeatureMenu.vue';
import TheBodyToolsSubsamplingMenu from './TheBodyToolsSubsamplingMenu.vue';

export default defineComponent({
  name: 'TheBodyTools',
  components: {
    TheBodyToolsFeatureMenu,
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
    'update:subsampling': null,
  },
});
</script>
