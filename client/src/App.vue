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
        <template v-if="enableProjection">
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
import {
  Process,
  MethodParams,
  WorkflowNode,
  WorkflowNodeType,
} from '@/commons/types';
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
    ...mapState('workflow', ['nodes']),
    methodsOfSampling(): Process[] {
      const nodes = this.nodes as WorkflowNode[];
      const type = WorkflowNodeType.DataObjectSelection;
      const methods = nodes.filter((d) => d.type === type)
        .map((d) => d.value).flat() as Process[];
      return methods;
    },
    methodsOfLabeling(): Process[] {
      const nodes = this.nodes as WorkflowNode[];
      const type = WorkflowNodeType.InteractiveLabeling;
      const methods = nodes.filter((d) => d.type === type)
        .map((d) => d.value).flat() as Process[];
      return methods;
    },
    enableProjection(): boolean {
      const methods = this.methodsOfSampling;
      return methods.findIndex((d) => d.api === 'Projection') >= 0;
    },
    enableSingleObjectDisplay(): boolean {
      const methods = this.methodsOfLabeling;
      return methods.findIndex((d) => d.api === 'SingleObjectDisplay') >= 0;
    },
    enableGridMatrix(): boolean {
      const methods = this.methodsOfLabeling;
      return methods.findIndex((d) => d.api === 'GridMatrix') >= 0;
    },
    itemsPerRow(): number | null {
      const methods = this.methodsOfLabeling;
      const gridMatrix = methods.find((d) => d.api === 'GridMatrix');
      return gridMatrix === undefined
        ? null
        : (gridMatrix.params as MethodParams).nColumns.value as number;
    },
    itemsPerCol(): number | null {
      const methods = this.methodsOfLabeling;
      const gridMatrix = methods.find((d) => d.api === 'GridMatrix');
      return gridMatrix === undefined
        ? null
        : (gridMatrix.params as MethodParams).nRows.value as number;
    },
    nViews(): number {
      const {
        enableProjection,
        enableSingleObjectDisplay,
        enableGridMatrix,
      } = this;
      return Number(enableProjection)
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
