<template>
  <v-card width="250">
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
      <v-container style="height: 200px; width: fit-content;">
        <div
          v-for="(bar, i) in stackedBars"
          :key="i"
          :style="{
            'width': '40px',
            'height': bar.height,
            'background-color': bar.color,
          }"
        />
      </v-container>
      <v-list
        style="margin: auto"
        dense
      >
        <v-list-item
          v-for="(entry, i) in statusList"
          :key="i"
        >
          <v-icon
            class="pr-2"
            aria-hidden="true"
            small
            :style="{ color: entry.color }"
          >
            $vuetify.icons.values.square
          </v-icon>
          <span style="width: 4rem">
            {{ entry.label }}
          </span>
          {{ entry.value }}
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
    nLabeled(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.Labeled).length;
    },
    nSkipped(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.Skipped).length;
    },
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
    statusList() {
      const {
        nLabeled,
        nSkipped,
        nTotal,
        nUnseen,
        nViewing,
      } = this;
      return [
        { label: 'Total', value: nTotal, color: 'white' },
        { label: 'Labeled', value: nLabeled, color: '#0078d4' },
        { label: 'Skipped', value: nSkipped, color: '#9a765e' },
        { label: 'Unseen', value: nUnseen, color: '#d9d9d9' },
        { label: 'Viewing', value: nViewing, color: '#ea8d18' },
      ];
    },
    stackedBars() {
      const {
        nLabeled,
        nSkipped,
        nTotal,
        nUnseen,
        nViewing,
      } = this;
      if (nTotal === 0) {
        return [
          { height: '100%', color: '#0078d4' },
        ];
      }
      return [
        { height: `${(nLabeled / nTotal) * 100}%`, color: '#0078d4' },
        { height: `${(nSkipped / nTotal) * 100}%`, color: '#9a765e' },
        { height: `${(nUnseen / nTotal) * 100}%`, color: '#d9d9d9' },
        { height: `${(nViewing / nTotal) * 100}%`, color: '#ea8d18' },
      ];
    },
  },
});
</script>
