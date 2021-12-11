<template>
  <div
    class="card-elevated"
    style="display: flex; flex-direction: column;"
  >
    <TheHeader
      :data-type="dataType"
      :label-tasks="labelTasks"
      :label="label"
      :category-tasks="categoryTasks"
      :label2color="label2color"
      :toolbar-state="toolbarState"
      @upsert:labels="onUpsertLabels"
      @upsert:toolbar-state="onUpsertToolbarState"
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <div
      v-if="showDataObject"
      style="flex: 1 1 auto; display: flex; flex-direction: column;"
    >
      <TheBody
        :data-type="dataType"
        :label-tasks="labelTasks"
        :data-object="dataObject"
        :label="label"
        :unlabeled-mark="unlabeledMark"
        :label2color="label2color"
        :toolbar-state="toolbarState"
        style="height: 0px; flex: 1 1 auto;"
        @upsert:labels="onUpsertLabels"
        @upsert:toolbar-state="onUpsertToolbarState"
      />
      <template v-if="enablePagination">
        <v-divider />
        <v-pagination
          v-model="page"
          :length="nPages"
          :total-visible="Math.min(5, nPages)"
        />
      </template>
    </div>
    <div
      v-else
      class="subtitle-1 mx-auto"
      style="flex: 1 1 auto; display: flex; align-items: center;"
    >
      No Data Objects Queried
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type {
  Category,
  DataType,
  IDataObject,
  ILabel,
  LabelTaskType,
  TaskWindow,
} from '@/commons/types';
import TheHeader from './TheHeader.vue';
import TheBody from './TheBody.vue';
import type { ToolbarState } from './types';

export default defineComponent({
  name: 'TheSingleObjectBoard',
  components: { TheHeader, TheBody },
  props: {
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    dataObjects: {
      type: Array as PropType<IDataObject[]>,
      required: true,
    },
    labels: {
      type: Array as PropType<ILabel[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
  },
  emits: {
    'update:task-window': null,
    'upsert:labels': null,
  },
  data() {
    return {
      toolbarState: null as ToolbarState | null,
      page: 1 as number,
    };
  },
  computed: {
    showDataObject(): boolean {
      const { dataObjects } = this;
      return dataObjects !== null && dataObjects.length !== 0;
    },
    dataObject(): IDataObject | null {
      if (!this.showDataObject) return null;
      return this.dataObjects[this.page - 1];
    },
    label(): ILabel | null {
      if (!this.showDataObject) return null;
      if (this.labels === null) return null;
      return this.labels[this.page - 1];
    },
    enablePagination(): boolean {
      if (!this.showDataObject) return false;
      return this.dataObjects.length >= 2;
    },
    nPages(): number {
      if (!this.showDataObject) return 0;
      return this.dataObjects.length;
    },
  },
  watch: {
    dataObjects() {
      // reset page number
      this.page = 1;
    },
  },
  mounted() {
    this.page = 1;
  },
  methods: {
    onUpsertLabels(partialLabel: Partial<ILabel>): void {
      const { dataObject } = this;
      if (dataObject === null) return;
      this.$emit('upsert:labels', { uuid: dataObject.uuid, ...partialLabel });
    },
    onUpsertToolbarState(partialState: Partial<ToolbarState>): void {
      this.toolbarState = { ...this.toolbarState, ...partialState };
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
.card-elevated {
  @extend .elevation-2;
  @extend .card;
}
</style>
