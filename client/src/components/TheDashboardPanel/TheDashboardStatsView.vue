<template>
  <v-container class="pa-0">
    <v-row no-gutters>
      <TheDashboardProgressView />
      <v-card
        v-if="containsClassification"
        class="ml-2"
        width="450"
        tile
      >
        <v-card-title class="view-header">
          <v-icon
            class="px-2"
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.info
          </v-icon>
          Label Class Distribution
        </v-card-title>
        <v-divider />
        <v-card-actions class="pa-0">
        </v-card-actions>
      </v-card>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import { LabelTaskType, Status } from '@/commons/types';
import TheDashboardProgressView from './TheDashboardProgressView.vue';

export default Vue.extend({
  name: 'TheDashboardStatsView',
  components: {
    TheDashboardProgressView,
  },
  computed: {
    ...mapState(['classes', 'labels']),
    ...mapGetters('workflow', ['labelTasks']),
    containsClassification(): boolean {
      return (this.labelTasks as LabelTaskType[]).includes(LabelTaskType.Classification);
    },
    nClasses(): number {
      return this.classes.length;
    },
  },
});
</script>
