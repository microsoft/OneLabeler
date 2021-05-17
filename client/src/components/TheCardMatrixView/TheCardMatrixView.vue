<template>
  <v-card>
    <TheCardMatrixViewHeader
      :classes="classes"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @click:batch-label="onClickBatchLabel"
      @window:minimize="onWindowMinimize"
      @window:pin="onWindowPin"
    />
    <v-divider />
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 30px)"
    >
      <VCardMatrix
        v-if="sampledDataObjects !== null && sampledDataObjects.length !== 0"
        style="height: 100%"
        :data-type="dataType"
        :data-objects="sampledDataObjects"
        :labels="sampledLabelCategories"
        :statuses="sampledStatuses"
        :classes="classes"
        :selected-uuids="selectedUuids"
        :items-per-row="itemsPerRow"
        :items-per-col="itemsPerCol"
        :label2color="label2color"
        @click:card="onClickCard"
        @click:card-label="onClickCardLabel"
      />
      <p
        v-else
        class="mx-auto subtitle-1"
      >
        No Data Objects Queried
      </p>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  IDataObject,
  ILabelCategory,
  ILabel,
  Status,
  TaskWindow,
} from '@/commons/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';
import VCardMatrix from './VCardMatrix.vue';
import TheCardMatrixViewHeader from './TheCardMatrixViewHeader.vue';

export default Vue.extend({
  name: 'TheCardMatrixView',
  components: {
    VCardMatrix,
    TheCardMatrixViewHeader,
  },
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
    itemsPerRow: {
      type: Number,
      required: true,
    },
    itemsPerCol: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      selectedUuids: [] as string[],
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'classes',
      'labels',
      'unlabeledMark',
    ]),
    ...mapGetters([
      'sampledDataObjects',
      'sampledLabels',
      'sampledStatuses',
      'label2color',
    ]),
    ...mapGetters('workflow', ['dataType']),
    sampledLabelCategories() {
      return this.sampledLabels.map((d) => d.category);
    },
  },
  methods: {
    ...mapActions([
      'setLabelCategoryOf',
      'setLabelCategoriesOf',
      'setStatusOf',
      'setStatusesOf',
      'pushCommandHistory',
      'editTaskWindow',
    ]),
    getLabel(dataObject: IDataObject): ILabelCategory {
      const labels = this.labels as ILabel[];
      const { uuid } = dataObject;
      const label = labels.find((d) => d.uuid === uuid);
      if (label === undefined) return this.unlabeledMark;
      return label.category as ILabelCategory;
    },
    onClickBatchLabel(label: ILabelCategory): void {
      const { selectedUuids } = this;
      let dataObjects = this.sampledDataObjects as IDataObject[];

      // If multi-selection is applied, set the labels for the selected objects.
      if (selectedUuids.length !== 0) {
        dataObjects = dataObjects.filter((d) => selectedUuids.includes(d.uuid));
      }

      const nBatch = dataObjects.length;
      const oldLabels = dataObjects.map((dataObject: IDataObject) => (
        this.getLabel(dataObject)
      ));
      const newLabels = Array(nBatch).fill(label);
      const editBatch = (ds: IDataObject[], ls: ILabelCategory[]): void => {
        this.setLabelCategoriesOf({
          uuids: ds.map((d: IDataObject) => d.uuid),
          labels: ls,
          queried: true,
        });
        this.setStatusesOf({
          uuids: ds.map((d: IDataObject) => d.uuid),
          statuses: ds.map(() => Status.Labeled),
          queried: true,
        });
      };
      const editBatchCommand = new EditBatchCommand(dataObjects, oldLabels, newLabels, editBatch);
      editBatchCommand.execute();
      this.pushCommandHistory(editBatchCommand);
    },
    onClickCardLabel(dataObject: IDataObject, label: ILabelCategory): void {
      const oldLabel = this.getLabel(dataObject);
      const editSingle = (d: IDataObject, l: ILabelCategory): void => {
        this.setLabelCategoryOf({ uuid: d.uuid, label: l, queried: true });
        this.setStatusOf({ uuid: d.uuid, status: Status.Labeled, queried: true });
      };
      const editSingleCommand = new EditSingleCommand(dataObject, oldLabel, label, editSingle);
      editSingleCommand.execute();
      this.pushCommandHistory(editSingleCommand);
    },
    onClickCard(dataObject: IDataObject, e: MouseEvent): void {
      const { uuid } = dataObject;
      const { ctrlKey } = e;
      if (!ctrlKey) {
        this.selectedUuids = [];
        return;
      }
      const idx = this.selectedUuids.findIndex((d) => d === uuid);
      if (idx >= 0) {
        const selectedUuids = [
          ...this.selectedUuids.slice(0, idx),
          ...this.selectedUuids.slice(idx + 1),
        ];
        this.selectedUuids = selectedUuids;
      } else {
        this.selectedUuids = [...this.selectedUuids, uuid];
      }
    },
    onWindowMinimize() {
      const { taskWindow } = this;
      this.editTaskWindow({
        ...taskWindow,
        isMinimized: true,
      });
    },
    onWindowPin() {
      const { taskWindow } = this;
      this.editTaskWindow({
        ...taskWindow,
        isPinned: true,
      });
    },
  },
});
</script>
