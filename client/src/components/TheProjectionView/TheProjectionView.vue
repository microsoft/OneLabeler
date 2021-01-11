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
      <v-container
        class="pa-0"
        style="height: 100%"
        fluid
      >
        <VProjection
          :feature-values="featureValues"
          :uuids="uuids"
          :labels="labels"
          :statuses="statuses"
          :classes="classes"
          :unlabeled-mark="unlabeledMark"
          :query-indices="queryIndices"
          :projection-method="selectedProjectionMethod"
          @select-uuids="onSelectUuids"
        />
      </v-container>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { Status } from '@/commons/types';
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
      'uuidToIdx',
      'labels',
      'statuses',
      'unlabeledMark',
      'queryIndices',
    ]),
    ...mapState('workflow', ['classes']),
    ...mapGetters(['featureValues', 'uuids']),
  },
  methods: {
    ...mapActions('workflow', ['sampleDataObjectsManual']),
    onClickProjectionMethod(method: ProjectionMethod) {
      this.selectedProjectionMethod = method;
    },
    onSelectUuids(uuids: string[]) {
      const { uuidToIdx, statuses } = this;
      const indices = uuids
        .map((uuid) => uuidToIdx[uuid])
        .filter((idx) => statuses[idx] !== Status.LABELED);
      this.sampleDataObjectsManual(indices);
    },
  },
});
</script>
