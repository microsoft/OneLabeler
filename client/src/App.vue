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
        <template v-if="showDatasetOverview">
          <v-col
            :cols="12/nViews"
            :class="(enableImageClassification
              || enableImageSegmentation
              || enableObjectDetection) ? 'pr-1' : ''"
          >
            <TheProjectionView style="height: 100%;" />
          </v-col>
        </template>
        <template v-if="enableImageClassification">
          <v-col
            :cols="12/nViews"
            :class="enableImageSegmentation
              || enableObjectDetection ? 'pr-1' : ''"
          >
            <TheCardMatrixView style="height: 100%;" />
          </v-col>
        </template>
        <template v-if="enableImageSegmentation || enableObjectDetection">
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
import { LabelTaskType } from '@/commons/types';
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
    ...mapState('workflow', ['showDatasetOverview', 'labelTasks']),
    enableImageClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ImageClassification,
      ) >= 0;
    },
    enableObjectDetection(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ObjectDetection,
      ) >= 0;
    },
    enableImageSegmentation(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.ImageSegmentation,
      ) >= 0;
    },
    nViews(): number {
      const {
        showDatasetOverview,
        enableImageClassification,
        enableObjectDetection,
        enableImageSegmentation,
      } = this;
      return Number(showDatasetOverview)
        + Number(enableImageClassification)
        + Number(enableObjectDetection || enableImageSegmentation);
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
