<template>
  <v-card class="rounded-0">
    <v-toolbar
      class="app-header"
      height="35"
    >
      <v-toolbar-title class="app-header-logo pl-2 pr-2">
        Dashboard
      </v-toolbar-title>

      <v-divider
        class="app-header-divider"
        vertical
      />

      <v-spacer />

      <v-btn
        class="mr-1"
        title="Close"
        color="white"
        icon
        tile
        small
        @click="onClickClose"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.close
        </v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text class="pa-1">
      <v-row no-gutters>
        <TheDashboardProgressView />
        <TheDashboardLabelDistributionView
          v-if="containsClassification"
          class="ml-1"
        />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { LabelTaskType } from '@/commons/types';
import TheDashboardProgressView from './TheDashboardProgressView.vue';
import TheDashboardLabelDistributionView from './TheDashboardLabelDistributionView.vue';

export default Vue.extend({
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
  methods: {
    onClickClose(): void {
      this.$emit('click:close');
    },
  },
});
</script>
