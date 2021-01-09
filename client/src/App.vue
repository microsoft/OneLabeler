<template>
  <v-app id="app">
    <v-container
      class="pa-0"
      fill-height
      fluid
    >
      <v-row
        no-gutters
        class="pa-0"
      >
        <TheNavBarView :height="navBarHeight" />
      </v-row>
      <v-row
        no-gutters
        class="pa-1"
        :style="`height: calc(100% - ${navBarHeight + footerHeight}px);`"
      >
        <template v-if="showDatasetOverview">
          <v-col
            cols="5"
            class="pr-1"
          >
            <TheProjectionView style="height: 100%;" />
          </v-col>
          <v-col cols="7">
            <TheCardMatrixView style="height: 100%;" />
          </v-col>
        </template>
        <template v-else>
          <v-col cols="12">
            <TheCardMatrixView style="height: 100%;" />
          </v-col>
        </template>
      </v-row>
      <v-row
        no-gutters
        class="pa-0"
      >
        <TheFooterView :height="footerHeight" />
      </v-row>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';
import TheCardMatrixView from '@/components/TheCardMatrixView/TheCardMatrixView.vue';
import TheProjectionView from '@/components/TheProjectionView/TheProjectionView.vue';
import TheFooterView from '@/components/TheFooterView/TheFooterView.vue';

@Component({
  name: 'App',
  components: {
    TheNavBarView,
    TheCardMatrixView,
    TheProjectionView,
    TheFooterView,
  },
  computed: {
    ...mapState('workflow', ['showDatasetOverview']),
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
