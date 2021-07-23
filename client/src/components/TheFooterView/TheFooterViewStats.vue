<template>
  <div style="display: flex; align-items: center;">
    <v-divider vertical />
    <span class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${nTotal} data objects` }}
    </span>
    <v-divider vertical />
    <span class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${nLabeled} / ${nTotal} labeled` }}
    </span>
    <v-divider vertical />
    <span class="ml-2 mr-1 subtitle-2 grey--text text--lighten-2">
      {{ `${classes.length} classes` }}
    </span>

    <!-- The create new class option button. -->
    <TheClassesDialog
      :classes="classes"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @add:category="addCategory($event)"
      @remove:category="removeCategory($event)"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  IDataObjectStorage,
  IStatusStorage,
  StatusType,
} from '@/commons/types';
import TheClassesDialog from './TheClassesDialog.vue';

export default Vue.extend({
  name: 'TheFooterView',
  components: { TheClassesDialog },
  data() {
    return {
      nTotal: 0,
      nLabeled: 0,
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'statuses',
      'classes',
      'unlabeledMark',
    ]),
    ...mapGetters(['label2color']),
  },
  watch: {
    async statuses(): Promise<void> {
      await this.setData();
    },
  },
  async mounted(): Promise<void> {
    await this.setData();
  },
  methods: {
    ...mapActions(['addCategory', 'removeCategory']),
    async setData(): Promise<void> {
      this.nLabeled = await this.getNLabeled();
      this.nTotal = await this.getNTotal();
    },
    async getNLabeled(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count({ value: StatusType.Labeled });
    },
    async getNTotal(): Promise<number> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      if (dataObjects === null) return 0;
      return dataObjects.count();
    },
  },
});
</script>
