<template>
  <div style="display: flex; align-items: center; gap: 8px;">
    <v-divider vertical />
    <span class="footer-text">
      {{ `${nTotal} data objects` }}
    </span>
    <v-divider vertical />
    <span class="footer-text">
      {{ `${nLabeled} / ${nTotal} labeled` }}
    </span>
    <v-divider vertical />
    <span class="footer-text">
      {{ `${classes.length} classes` }}
    </span>

    <!-- The create new class option button. -->
    <TheClassesDialog
      :categories="classes"
      :category-tasks="categoryTasks"
      :label-tasks="labelTasks"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @add:category="addCategory($event)"
      @remove:category="removeCategory($event)"
      @set:category-tasks="setCategoryTasks($event)"
      @upsert:color-mapper="upsertColorMapper($event)"
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

/*
const useDataObjects = (dataObjects: Ref<IDataObjectStorage | null>) => {
  const nTotal: Ref<number> = ref(0);
  const updateNLabeled = async (): Promise<void> => {
    if (dataObjects.value === null) nTotal.value = 0;
    else nTotal.value = await dataObjects.value.count();
  };
  onMounted(updateNLabeled);
  watch(dataObjects, updateNLabeled);
  return { nTotal };
};

const useStatuses = (statuses: Ref<IStatusStorage | null>) => {
  const nLabeled: Ref<number> = ref(0);
  const updateNLabeled = async (): Promise<void> => {
    if (statuses.value === null) nLabeled.value = 0;
    else nLabeled.value = await statuses.value.count({ value: StatusType.Labeled });
  };
  onMounted(updateNLabeled);
  watch(statuses, updateNLabeled);
  return { nLabeled };
};
*/

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
      'categoryTasks',
      'unlabeledMark',
    ]),
    ...mapGetters(['label2color']),
    ...mapGetters('workflow', ['labelTasks']),
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
    ...mapActions([
      'addCategory',
      'removeCategory',
      'setCategoryTasks',
      'upsertColorMapper',
    ]),
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

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';

.footer-text {
  @extend .subtitle-2;
  @extend .grey--text;
  @extend .text--lighten-2;
}
</style>
