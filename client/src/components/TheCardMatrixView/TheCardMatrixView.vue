<template>
  <v-card>
    <TheCardMatrixViewHeader
      :classes="classes"
      :unlabeled-mark="unlabeledMark"
      :label2color="label2color"
      @click:batch-label="onClickBatchLabel"
    />
    <v-divider />
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 30px)"
    >
      <VCardMatrix
        v-if="queryIndices !== null && queryIndices.length !== 0"
        style="height: 100%"
        :data-type="dataType"
        :data-objects="sampledDataObjects"
        :labels="sampledDataObjectLabels"
        :classes="classes"
        :items-per-row="itemsPerRow"
        :items-per-col="itemsPerCol"
        :label2color="label2color"
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
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { IDataObject, Label } from '@/commons/types';
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
    itemsPerRow: {
      type: Number,
      required: true,
    },
    itemsPerCol: {
      type: Number,
      required: true,
    },
  },
  computed: {
    ...mapState([
      'dataObjects',
      'classes',
      'labels',
      'queryIndices',
      'unlabeledMark',
    ]),
    ...mapGetters([
      'sampledDataObjects',
      'sampledDataObjectLabels',
      'label2color',
    ]),
    ...mapGetters('workflow', ['dataType']),
  },
  methods: {
    ...mapActions([
      'setDataObjectLabel',
      'setDataObjectLabels',
      'pushCommandHistory',
    ]),
    getLabel(dataObject: IDataObject, inQueryIndices = false): Label {
      const { dataObjects, labels, queryIndices } = this;
      const { uuid } = dataObject;
      const idx = inQueryIndices
        ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
        : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
      console.assert(idx !== undefined && idx >= 0, `Data object not found: uuid = ${uuid}`);
      return labels[idx];
    },
    onClickBatchLabel(label: Label): void {
      const dataObjects = this.sampledDataObjects;
      const nBatch = dataObjects.length;
      const oldLabels = dataObjects.map((dataObject: IDataObject) => (
        this.getLabel(dataObject, true)
      ));
      const newLabels = Array(nBatch).fill(label);
      const editBatch = (ds: IDataObject[], ls: Label[]): void => {
        this.setDataObjectLabels({
          uuids: ds.map((d: IDataObject) => d.uuid),
          labels: ls,
          inQueryIndices: true,
        });
      };
      const editBatchCommand = new EditBatchCommand(dataObjects, oldLabels, newLabels, editBatch);
      editBatchCommand.execute();
      this.pushCommandHistory(editBatchCommand);
    },
    onClickCardLabel(dataObject: IDataObject, label: Label): void {
      const oldLabel = this.getLabel(dataObject, true);
      const editSingle = (d: IDataObject, l: Label): void => {
        this.setDataObjectLabel({ uuid: d.uuid, label: l, inQueryIndices: true });
      };
      const editSingleCommand = new EditSingleCommand(dataObject, oldLabel, label, editSingle);
      editSingleCommand.execute();
      this.pushCommandHistory(editSingleCommand);
    },
  },
});
</script>
