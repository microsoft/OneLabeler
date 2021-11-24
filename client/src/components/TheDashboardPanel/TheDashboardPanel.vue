<template>
  <v-card class="rounded-0">
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
      style="display: flex; flex-direction: row;"
    >
      <TheDashboardProgressView />
      <TheDashboardLabelDistributionView
        v-if="containsClassification"
        class="ml-1"
      />
    </div>
  </v-card>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { LabelTaskType } from '@/commons/types';
import TheDashboardProgressView from './TheDashboardProgressView.vue';
import TheDashboardLabelDistributionView from './TheDashboardLabelDistributionView.vue';

export default {
  name: 'TheDashboardPanel',
  components: {
    TheDashboardProgressView,
    TheDashboardLabelDistributionView,
  },
  computed: {
    ...mapGetters('workflow', ['labelTasks']),
    containsClassification(): boolean {
      return (this.labelTasks as LabelTaskType[]).includes(LabelTaskType.Classification);
    },
  },
};
</script>
