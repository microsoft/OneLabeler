<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div :style="style.cardElevated">
    <div :style="style.cardHeader">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Progress
    </div>
    <v-divider />
    <div style="display: flex">
      <div
        class="py-3"
        style="height: 370px; width: fit-content; margin: auto"
      >
        <div
          v-for="(bar, i) in stackedBars"
          :key="i"
          :style="{
            'width': '40px',
            'height': bar.height,
            'background-color': bar.color,
          }"
        />
      </div>
      <div style="margin: auto">
        <div
          v-for="(entry, i) in statusList"
          :key="i"
          style="display: flex; align-items: center; min-height: 40px;"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapState } from 'vuex';
import { StatusType } from '@/commons/types';
import type { IDataObjectStorage, IStatusStorage } from '@/commons/types';
import { cardElevated, cardHeader } from '@/style';

export default defineComponent({
  name: 'TheDashboardProgressView',
  data() {
    return {
      style: { cardElevated, cardHeader },
      nLabeled: 0,
      nSkipped: 0,
      nTotal: 0,
      nUnseen: 0,
      nViewing: 0,
    };
  },
  computed: {
    ...mapState(['dataObjects', 'labels', 'statuses']),
    statusList(): { label: string, value: number, color: string }[] {
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
    stackedBars(): { height: string, color: string }[] {
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
    async dataObjects() {
      await this.setData();
    },
    async labels() {
      await this.setData();
    },
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
      return statuses.countByValue(StatusType.Labeled);
    },
    async getNSkipped(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null};
      if (statuses === null) return 0;
      return statuses.countByValue(StatusType.Skipped);
    },
    async getNTotal(): Promise<number> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      if (dataObjects === null) return 0;
      return dataObjects.count();
    },
    async getNUnseen(): Promise<number> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (dataObjects === null || statuses === null) return 0;
      const nTotalDataObjects = await dataObjects.count();
      const nTotalStatuses = await statuses.count();
      const nUnseen = await statuses.countByValue(StatusType.New);
      return nUnseen + nTotalDataObjects - nTotalStatuses;
    },
    async getNViewing(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.countByValue(StatusType.Viewed);
    },
  },
});
</script>
