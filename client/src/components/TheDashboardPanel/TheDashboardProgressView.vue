<template>
  <v-card
    width="220"
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
      Progress
    </v-card-title>
    <v-divider />
    <v-card-actions class="pa-0">
      <v-container
        class="ma-0"
        style="height: 200px; width: fit-content;"
      >
        <template v-if="nTotal === 0">
          <div
            class="pa-0 ma-0"
            :style="{
              'width': '40px',
              'height': '100%',
              'background-color': '#0078d4',
            }"
          />
        </template>
        <template v-else>
          <div
            :style="{
              'width': '40px',
              'height': nLabeled / nTotal * 100 + '%',
              'background-color': '#0078d4',
            }"
          />
          <div
            :style="{
              'width': '40px',
              'height': nSkipped / nTotal * 100 + '%',
              'background-color': '#9a765e',
            }"
          />
          <div
            :style="{
              'width': '40px',
              'height': nUnseen / nTotal * 100 + '%',
              'background-color': '#d9d9d9',
            }"
          />
          <div
            :style="{
              'width': '40px',
              'height': nViewing / nTotal * 100 + '%',
              'background-color': '#ea8d18',
            }"
          />
        </template>
      </v-container>
      <v-list dense>
        <v-list-item>
          <v-icon
            class="pr-2"
            aria-hidden="true"
            small
            style="color: white"
          >
            $vuetify.icons.values.square
          </v-icon>
          <span style="width: 60px">
            Total
          </span>
          {{ nTotal }}
        </v-list-item>
        <v-list-item>
          <v-icon
            class="pr-2"
            aria-hidden="true"
            small
            style="color: #0078d4"
          >
            $vuetify.icons.values.square
          </v-icon>
          <span style="width: 60px">
            Labeled
          </span>
          {{ nLabeled }}
        </v-list-item>
        <v-list-item>
          <v-icon
            class="pr-2"
            aria-hidden="true"
            small
            style="color: #9a765e"
          >
            $vuetify.icons.values.square
          </v-icon>
          <span style="width: 60px">
            Skipped
          </span>
          {{ nSkipped }}
        </v-list-item>
        <v-list-item>
          <v-icon
            class="pr-2"
            aria-hidden="true"
            small
            style="color: #d9d9d9"
          >
            $vuetify.icons.values.square
          </v-icon>
          <span style="width: 60px">
            Unseen
          </span>
          {{ nUnseen }}
        </v-list-item>
        <v-list-item>
          <v-icon
            class="pr-2"
            aria-hidden="true"
            small
            style="color: #ea8d18"
          >
            $vuetify.icons.values.square
          </v-icon>
          <span style="width: 60px">
            Viewing
          </span>
          {{ nViewing }}
        </v-list-item>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { Status } from '@/commons/types';

export default Vue.extend({
  name: 'TheDashboardProgressView',
  computed: {
    ...mapState(['statuses']),
    nTotal(): number {
      return this.statuses.length;
    },
    nUnseen(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.New).length;
    },
    nViewing(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.Viewed).length;
    },
    nLabeled(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.Labeled).length;
    },
    nSkipped(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.Skipped).length;
    },
  },
});
</script>
