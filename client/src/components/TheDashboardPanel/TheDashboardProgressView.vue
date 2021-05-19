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
import { IStatusStorage, StatusType } from '@/commons/types';

export default Vue.extend({
  name: 'TheDashboardProgressView',
  data() {
    return {
      nLabeled: 0,
      nSkipped: 0,
      nTotal: 0,
      nUnseen: 0,
      nViewing: 0,
    };
  },
  computed: {
    ...mapState(['statuses']),
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
  watch: {
    async statuses() {
      await this.setData();
    },
  },
  async mounted() {
    await this.setData();
  },
  methods: {
    async setData(): Promise<void> {
      this.nLabeled = await this.getNLabeled();
      this.nSkipped = await this.getNSkipped();
      this.nTotal = await this.getNTotal();
      this.nUnseen = await this.getNUnseen();
      this.nViewing = await this.getNViewing();
    },
    async getNLabeled(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count((d) => d.value === StatusType.Labeled);
    },
    async getNSkipped(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null};
      if (statuses === null) return 0;
      return statuses.count((d) => d.value === StatusType.Skipped);
    },
    async getNTotal(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count();
    },
    async getNUnseen(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count((d) => d.value === StatusType.New);
    },
    async getNViewing(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count((d) => d.value === StatusType.Viewed);
    },
  },
});
</script>
