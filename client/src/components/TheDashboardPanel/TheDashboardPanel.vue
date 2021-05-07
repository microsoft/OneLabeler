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
    <v-card-text class="px-2 py-2">
      <TheDashboardStatsView />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import TheDashboardStatsView from './TheDashboardStatsView.vue';

export default Vue.extend({
  name: 'TheDashboardPanel',
  components: {
    TheDashboardStatsView,
  },
  methods: {
    onClickClose(): void {
      this.$emit('click:close');
    },
  },
});
</script>
