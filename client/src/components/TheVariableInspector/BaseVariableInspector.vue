<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="style.cardElevated"
    style="display: flex; flex-direction: column; overflow-wrap: break-word; min-width: 0;"
  >
    <div :style="style.cardHeader">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Variable Inspector
    </div>
    <v-divider />
    <div style="flex: 1 1 auto; overflow-y: scroll; height: 0;">
      <!-- data objects -->
      <VInspectDataObjects
        :data-objects="dataObjects"
        :scoped-uuids="scopeUuids"
      />

      <!-- features -->
      <VInspectFeatures
        :data-objects="dataObjects"
        :scoped-uuids="scopeUuids"
      />

      <!-- labels -->
      <VInspectLabels
        :data-objects="dataObjects"
        :labels="labels"
        :scoped-uuids="scopeUuids"
      />

      <!-- samples -->
      <VInspectSamples :query-uuids="queryUuids" />

      <!-- label categories -->
      <VInspectCategories :categories="categories" />

      <!-- stop -->
      <VInspectStop :stop="stop" />

      <!-- model -->
      <VInspectModel :models="models" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type {
  Category,
  IDataObjectStorage,
  ILabelStorage,
  ModelService,
} from '@/commons/types';
import { cardElevated, cardHeader } from '@/style';
import VInspectDataObjects from './VInspectDataObjects.vue';
import VInspectFeatures from './VInspectFeatures.vue';
import VInspectLabels from './VInspectLabels.vue';
import VInspectSamples from './VInspectSamples.vue';
import VInspectCategories from './VInspectCategories.vue';
import VInspectStop from './VInspectStop.vue';
import VInspectModel from './VInspectModel.vue';

export default defineComponent({
  name: 'BaseVariableInspector',
  components: {
    VInspectDataObjects,
    VInspectFeatures,
    VInspectLabels,
    VInspectSamples,
    VInspectCategories,
    VInspectStop,
    VInspectModel,
  },
  props: {
    dataObjects: {
      type: Object as PropType<IDataObjectStorage | null>,
      default: null,
    },
    labels: {
      type: Object as PropType<ILabelStorage | null>,
      default: null,
    },
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    stop: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    models: {
      type: Array as PropType<ModelService[]>,
      required: true,
    },
    scopeUuids: {
      type: Array as PropType<string[] | null>,
      default: null,
    },
  },
  data() {
    return { style: { cardElevated, cardHeader } };
  },
});
</script>
