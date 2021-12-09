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
            class="view-header-button ml-2"
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
        <v-card class="pa-3">
          <div class="subtitle-1 grey--text text--darken-1">
            {{ `${nRows} x ${nColumns} layout` }}
          </div>
          <div
            style="display: grid"
            :style="{
              'grid-template-rows': `repeat(${maxRows}, ${100/maxRows}%)`,
              'grid-template-columns': `repeat(${maxColumns}, ${100/maxColumns}%)`,
            }"
          >
            <template v-for="row in maxRows">
              <template v-for="column in maxColumns">
                <div
                  :key="`row-${row}-col-${column}`"
                  :style="{
                    'border-width': '1px',
                    'border-style': 'solid',
                    'border-color': (
                      (column <= nColumns) && (row <= nRows)
                    ) ? 'orange' : '#757575',
                    'width': '40px',
                    'height': '40px',
                    'margin': '0.5px',
                  }"
                  @click="$emit('set:matrix-shape', row, column)"
                />
              </template>
            </template>
          </div>
        </v-card>
      </v-menu>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default defineComponent({
  name: 'TheHeader',
  components: { VToolbar },
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
  data() {
    return {
      maxRows: 3,
      maxColumns: 3,
    };
  },
});
</script>
