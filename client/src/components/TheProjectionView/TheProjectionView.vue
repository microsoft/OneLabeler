<template>
  <v-card>
    <TheProjectionViewHeader
      :projection-method-menu="projectionMethodMenu"
      :selected-projection-method="selectedProjectionMethod"
      @click-projection-method="onClickProjectionMethod"
    />
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
        :projection-method="selectedProjectionMethod"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';
import TheProjectionViewHeader from './TheProjectionViewHeader.vue';
import VProjection, { ProjectionMethod } from './VProjection.vue';

export default Vue.extend({
  name: 'TheProjectionView',
  components: {
    TheProjectionViewHeader,
    VProjection,
  },
  data() {
    return {
      projectionMethodMenu: {
        options: [
          ProjectionMethod.PCA,
          ProjectionMethod.MDS,
          ProjectionMethod.TSNE,
        ],
        optionsText: [
          ProjectionMethod.PCA,
          ProjectionMethod.MDS,
          ProjectionMethod.TSNE,
        ],
      },
      selectedProjectionMethod: ProjectionMethod.PCA,
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'statuses',
      'unlabeledMark',
      'queryIndices',
    ]),
    ...mapState('workflow', ['classes']),
    ...mapGetters(['featureValues']),
  },
  methods: {
    onClickProjectionMethod(method: ProjectionMethod) {
      this.selectedProjectionMethod = method;
    },
  },
});
</script>
