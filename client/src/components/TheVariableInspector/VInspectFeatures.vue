<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div>
    <div :style="style.cardHeader">
      <v-icon
        class="mx-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.features
      </v-icon>
      Features
    </div>
    <div
      v-if="maxVisible < nTotal"
      class="subtitle-2"
      style="padding: 4px; padding-bottom: 0px;"
    >
      {{ nTotal }} data objects exist, only load the features of first {{ maxVisible }}
    </div>
    <ObjectInspector
      :data="filteredFeatures"
      :array-max-properties="5"
      theme="chromeLight"
      style="padding: 4px;"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import ObjectInspector from 'vue-object-inspector';
import type { IDataObjectStorage } from '@/commons/types';
import { useFilteredDataObjects } from '@/components/composables/useFilteredStorage';
import { cardHeader } from '@/style';
import useNTotal from './utils/useNTotal';

export default defineComponent({
  name: 'VInspectFeatures',
  components: { ObjectInspector },
  props: {
    dataObjects: {
      type: Object as PropType<IDataObjectStorage | null>,
      default: null,
    },
    scopeUuids: {
      type: Array as PropType<string[] | null>,
      default: null,
    },
  },
  setup(props) {
    const { dataObjects, scopeUuids } = toRefs(props);
    return {
      ...useFilteredDataObjects(dataObjects, scopeUuids),
      ...useNTotal(dataObjects),
    };
  },
  data() {
    return { style: { cardHeader } };
  },
  computed: {
    maxVisible(): number {
      const { scopeUuids } = this;
      return scopeUuids === null ? Infinity : scopeUuids.length;
    },
    filteredFeatures(): number[][] | null {
      const { filteredDataObjects } = this;
      const featuresComputed = filteredDataObjects.length >= 1
        && filteredDataObjects[0].features !== undefined
        && filteredDataObjects[0].features !== null;
      return featuresComputed
        ? filteredDataObjects.map((d) => d.features as number[])
        : null;
    },
  },
});
</script>
