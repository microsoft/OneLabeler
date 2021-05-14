<template>
  <VToolbar
    @window:minimize="onClickMinimize"
    @window:pin="onClickPin"
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
        <v-card>
          <v-container>
            <v-card-title class="subtitle-1 pa-0 grey--text text--darken-1">
              {{ `${nRows} x ${nColumns} layout` }}
            </v-card-title>
            <template v-for="row in maxRows">
              <v-row
                :key="`row-${row}`"
                class="ma-0"
                style="padding: 0.5px 0px 0.5px 0px"
              >
                <template v-for="column in maxColumns">
                  <v-col
                    :key="`col-${column}`"
                    class="ma-0"
                    style="padding: 0px 0.5px 0px 0.5px"
                  >
                    <div
                      :style="{
                        'border-width': '1px',
                        'border-style': 'solid',
                        'border-color': (
                          (column <= nColumns) && (row <= nRows)
                        ) ? 'orange' : '#757575',
                        'width': '40px',
                        'height': '40px',
                      }"
                      @click="onSetMatrixShape(row, column)"
                    />
                  </v-col>
                </template>
              </v-row>
            </template>
          </v-container>
        </v-card>
      </v-menu>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default Vue.extend({
  name: 'TheProjectionViewHeader',
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
  data() {
    return {
      maxRows: 3,
      maxColumns: 3,
    };
  },
  methods: {
    onSetMatrixShape(nRows: number, nColumns: number) {
      this.$emit('set:matrix-shape', nRows, nColumns);
    },
    onClickMinimize() {
      this.$emit('window:minimize');
    },
    onClickPin() {
      this.$emit('window:pin');
    },
  },
});
</script>
