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
          v-for="category in classes"
          :key="category"
          class="pa-0"
        >
          <div
            class="mx-4"
            style="width: 250px;"
          >
            <div style="display: flex">
              <span style="font-weight: 700">
                {{ category }}
              </span>
              <v-spacer />
              {{ `${getNumberOfLabel(category)} / ${nLabeled}` }}
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
                  'width': `${getRateOfLabel(category) * 100}%`,
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
  ILabel,
  IStatus,
  StatusType,
} from '@/commons/types';

export default Vue.extend({
  name: 'TheDashboardLabelDistributionView',
  computed: {
    ...mapState(['classes', 'labels', 'statuses']),
    nLabeled(): number {
      const { statuses } = this as { statuses: IStatus[] };
      return statuses.filter((d) => d.value === StatusType.Labeled).length;
    },
  },
  methods: {
    getNumberOfLabel(category: Category): number {
      const labels = this.labels as ILabel[];
      if (labels === null) return 0;
      return labels.filter((d: ILabel) => d.category === category)
        .length;
    },
    getRateOfLabel(category: Category): number {
      const labels = this.labels as ILabel[];
      if (labels === null) return 0;
      if (this.nLabeled === 0) return 0;
      return labels.filter((d: ILabel) => d.category === category)
        .length / this.nLabeled;
    },
  },
});
</script>
