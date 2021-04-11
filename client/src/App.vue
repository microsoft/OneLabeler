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
            :class="(singleObjectDisplayEnabled
              || gridMatrixEnabled) ? 'pr-1' : ''"
          >
            <TheProjectionView style="height: 100%;" />
          </v-col>
        </template>
        <template v-if="gridMatrixEnabled">
          <v-col
            :cols="12/nViews"
            :class="singleObjectDisplayEnabled ? 'pr-1' : ''"
          >
            <TheCardMatrixView style="height: 100%;" />
          </v-col>
        </template>
        <template v-if="singleObjectDisplayEnabled">
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
      'showDatasetOverview',
      'singleObjectDisplayEnabled',
      'gridMatrixEnabled',
    ]),
    nViews(): number {
      const {
        showDatasetOverview,
        singleObjectDisplayEnabled,
        gridMatrixEnabled,
      } = this;
      return Number(showDatasetOverview)
        + Number(singleObjectDisplayEnabled)
        + Number(gridMatrixEnabled);
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
