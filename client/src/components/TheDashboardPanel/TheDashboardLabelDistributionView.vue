<template>
  <v-card width="250" height="250">
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
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 30px)"
    >
      <v-list
        class="pa-0"
        style="height: 100%; overflow-y: scroll"
        dense
      >
        <v-list-item
          v-for="className in classes"
          :key="className"
          class="pa-0"
        >
          <div
            class="mx-4"
            style="width: 250px;"
          >
            <div style="display: flex">
              <span style="font-weight: 700">
                {{ className }}
              </span>
              <v-spacer />
              {{ `${getNumberOfLabel(className)} / ${nLabeled}` }}
            </div>
            <div style="position: relative;">
              <div
                :style="{
                  'position': 'absolute',
                  'background-color': '#d9d9d9',
                  'height': '13px',
                  'width': '100%',
                }"
              />
              <div
                :style="{
                  'position': 'absolute',
                  'background-color': '#0078d4',
                  'height': '13px',
                  'width': `${getRateOfLabel(className) * 100}%`,
                }"
              />
            </div>
          </div>
        </v-list-item>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import {
  Category,
  Status,
} from '@/commons/types';

export default Vue.extend({
  name: 'TheDashboardLabelDistributionView',
  computed: {
    ...mapState(['classes', 'labels', 'statuses']),
    nLabeled(): number {
      const { statuses } = this as { statuses: Status[] };
      return statuses.filter((d) => d === Status.Labeled).length;
    },
  },
  methods: {
    getNumberOfLabel(className: Category): number {
      if (this.labels === null) return 0;
      return this.labels.filter((d: Category) => d === className)
        .length;
    },
    getRateOfLabel(className: Category): number {
      if (this.labels === null) return 0;
      if (this.nLabeled === 0) return 0;
      return this.labels.filter((d: Category) => d === className)
        .length / this.nLabeled;
    },
  },
});
</script>
