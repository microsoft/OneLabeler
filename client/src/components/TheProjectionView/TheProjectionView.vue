<template>
  <v-card>
    <TheProjectionViewHeader />
    <v-divider />
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 30px)"
    >
      <VProjection
        style="height: 100%"
        :feature-values="featureValues"
        :labels="labels"
        :statuses="statuses"
        :classes="classes"
        :unlabeled-mark="unlabeledMark"
        :query-indices="queryIndices"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import TheProjectionViewHeader from './TheProjectionViewHeader.vue';
import VProjection from './VProjection.vue';

export default Vue.extend({
  name: 'TheProjectionView',
  components: {
    TheProjectionViewHeader,
    VProjection,
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'statuses',
      'classes',
      'unlabeledMark',
      'queryIndices',
    ]),
    ...mapGetters([
      'featureValues',
    ]),
  },
});
</script>
