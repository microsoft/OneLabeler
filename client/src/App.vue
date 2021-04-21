<template>
  <v-app id="app">
    <v-container
      class="pa-0"
      fill-height
      fluid
    >
      <v-row
        class="pa-0"
        no-gutters
      >
        <TheNavBarView :height="navBarHeight" />
      </v-row>
      <v-row
        :style="`height: calc(100% - ${navBarHeight + footerHeight}px);`"
        class="pa-1"
        no-gutters
      >
        <template v-if="enableProjectionOverview">
          <v-col
            :cols="12/nViews"
            :class="(enableSingleObjectDisplay
              || enableGridMatrix) ? 'pr-1' : ''"
          >
            <TheProjectionView style="height: 100%;" />
          </v-col>
        </template>
        <template v-if="enableGridMatrix">
          <v-col
            :cols="12/nViews"
            :class="enableSingleObjectDisplay ? 'pr-1' : ''"
          >
            <TheCardMatrixView
              style="height: 100%;"
              :items-per-row="itemsPerRow"
              :items-per-col="itemsPerCol"
            />
          </v-col>
        </template>
        <template v-if="enableSingleObjectDisplay">
          <v-col
            :cols="12/nViews"
          >
            <ThePaintView style="height: 100%;" />
          </v-col>
        </template>
      </v-row>
      <v-row
        class="pa-0"
        no-gutters
      >
        <TheFooterView :height="footerHeight" />
      </v-row>
    </v-container>
    <TheMessageView />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { DataObjectSelectionMethod, InteractiveLabelingMethod } from '@/commons/types';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';
import TheCardMatrixView from '@/components/TheCardMatrixView/TheCardMatrixView.vue';
import ThePaintView from '@/components/ThePaintView/ThePaintView.vue';
import TheProjectionView from '@/components/TheProjectionView/TheProjectionView.vue';
import TheFooterView from '@/components/TheFooterView/TheFooterView.vue';
import TheMessageView from '@/components/TheMessageView/TheMessageView.vue';

@Component({
  name: 'App',
  components: {
    TheNavBarView,
    TheCardMatrixView,
    ThePaintView,
    TheProjectionView,
    TheFooterView,
    TheMessageView,
  },
  computed: {
    ...mapState('workflow', [
      'dataObjectSelectionMethod',
      'interactiveLabelingMethod',
    ]),
    enableProjectionOverview(): boolean {
      const methods = this.dataObjectSelectionMethod as DataObjectSelectionMethod[];
      return methods.findIndex((d) => d.id === 'Projection') >= 0;
    },
    enableSingleObjectDisplay(): boolean {
      const methods = this.interactiveLabelingMethod as InteractiveLabelingMethod[];
      return methods.findIndex((d) => d.id === 'Single-Object-Display') >= 0;
    },
    enableGridMatrix(): boolean {
      const methods = this.interactiveLabelingMethod as InteractiveLabelingMethod[];
      return methods.findIndex((d) => d.id === 'Grid-Matrix') >= 0;
    },
    itemsPerRow(): number | null {
      const methods = this.interactiveLabelingMethod as InteractiveLabelingMethod[];
      const gridMatrix = methods.find((d) => d.id === 'Grid-Matrix');
      return gridMatrix === undefined ? null : gridMatrix.params.nColumns.value;
    },
    itemsPerCol(): number | null {
      const methods = this.interactiveLabelingMethod as InteractiveLabelingMethod[];
      const gridMatrix = methods.find((d) => d.id === 'Grid-Matrix');
      return gridMatrix === undefined ? null : gridMatrix.params.nRows.value;
    },
    nViews(): number {
      const {
        enableProjectionOverview,
        enableSingleObjectDisplay,
        enableGridMatrix,
      } = this;
      return Number(enableProjectionOverview)
        + Number(enableSingleObjectDisplay)
        + Number(enableGridMatrix);
    },
  },
})
export default class App extends Vue {
  data(): { navBarHeight: number, footerHeight: number } {
    return {
      navBarHeight: 35,
      footerHeight: 30,
    };
  }
}
</script>
