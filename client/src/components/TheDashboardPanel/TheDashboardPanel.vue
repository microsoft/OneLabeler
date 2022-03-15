<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="background-color: white; display: flex; flex-direction: column;">
    <div
      class="app-header"
      style="display: flex; align-items: center; height: 35px;"
    >
      <div class="app-header-logo px-2">
        Dashboard
      </div>

      <div style="flex-grow: 1" />

      <v-btn
        class="mr-1"
        title="Close"
        color="white"
        icon
        tile
        small
        @click="$emit('click:close')"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.close
        </v-icon>
      </v-btn>
    </div>
    <div
      class="pa-1 subtitle-2"
      style="flex: 1 1 auto; display: flex; flex-direction: row;"
    >
      <TheDashboardProgressView style="width: 300px; height: 400px;" />
      <TheDashboardLabelDistributionView
        v-if="containsClassification"
        class="ml-1"
        style="width: 300px; height: 400px;"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapGetters } from 'vuex';
import { LabelTaskType } from '@/commons/types';
import TheDashboardProgressView from './TheDashboardProgressView.vue';
import TheDashboardLabelDistributionView from './TheDashboardLabelDistributionView.vue';

export default defineComponent({
  name: 'TheDashboardPanel',
  components: {
    TheDashboardProgressView,
    TheDashboardLabelDistributionView,
  },
  emits: {
    'click:close': null,
  },
  computed: {
    ...mapGetters('workflow', ['labelTasks']),
    containsClassification(): boolean {
      return (this.labelTasks as LabelTaskType[]).includes(LabelTaskType.Classification);
    },
  },
});
</script>
