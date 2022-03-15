<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
  >
    <template #title>
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.data
      </v-icon>
      Dataset Overview
    </template>
    <template #tools>
      <!-- The scatterplot matrix layout configuration menu. -->
      <v-menu
        offset-y
        :close-on-content-click="false"
      >
        <template #activator="{ on }">
          <v-btn
            title="Set Scatterplot Matrix Layout"
            class="card-header-button ml-2"
            x-small
            icon
            v-on="on"
          >
            <v-icon
              aria-hidden="true"
              small
              color="black"
              class="px-0"
            >
              $vuetify.icons.values.table
            </v-icon>
          </v-btn>
        </template>
        <TheHeaderLayoutPanel
          :n-rows="nRows"
          :n-columns="nColumns"
          @set:matrix-shape="$emit('set:matrix-shape', $event)"
        />
      </v-menu>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VToolbar from '@/components/VWindow/VToolbar.vue';
import TheHeaderLayoutPanel from './TheHeaderLayoutPanel.vue';

export default defineComponent({
  name: 'TheHeader',
  components: { VToolbar, TheHeaderLayoutPanel },
  props: {
    nRows: {
      type: Number as PropType<number>,
      required: true,
    },
    nColumns: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: {
    'window:minimize': null,
    'window:pin': null,
    'set:matrix-shape': null,
  },
});
</script>
