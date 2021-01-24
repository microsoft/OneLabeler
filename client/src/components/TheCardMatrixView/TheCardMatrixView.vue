<template>
  <v-card>
    <TheCardMatrixViewHeader
      :classes="classes"
      @click-add-class-option="onClickAddClassOption"
      @click-confirm-batch-labels="onClickConfirmBatchLabels"
      @click-set-batch-labels="onClickSetBatchLabels"
    />
    <v-divider />
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 30px)"
    >
      <VCardMatrix
        v-if="queryIndices !== null && queryIndices.length !== 0"
        style="height: 100%"
        :data-objects="sampledDataObjects"
        :labels="sampledDataObjectLabels"
        :classes="classes"
        :items-per-row="itemsPerRow"
        :items-per-col="itemsPerCol"
        @click-card-label="onClickCardLabel"
      />
      <template v-else>
        <p class="mx-auto subtitle-1">
          No Data Objects Queried
        </p>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { IDataObject, Label, MessageType } from '@/commons/types';
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
  computed: {
    ...mapState(['dataObjects', 'classes', 'labels', 'queryIndices']),
    ...mapState('workflow', ['itemsPerRow', 'itemsPerCol']),
    ...mapGetters(['sampledDataObjects', 'sampledDataObjectLabels']),
  },
  created(): void {
    // enable label flipping by number key
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // remove listener before distroy, otherwise the onKey method will be called multiple times
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    ...mapActions([
      'pushClasses',
      'setDataObjectLabel',
      'setDataObjectLabels',
      'setMessage',
      'pushCommandHistory',
    ]),
    ...mapActions('workflow', [
      'updateModel',
      'sampleDataObjectsAlgorithmic',
      'assignDefaultLabels',
    ]),
    onKey(e: KeyboardEvent): void {
      // shortcut for confirm labels: enter
      const { keyCode } = e;
      if (keyCode === 13) {
        this.onClickConfirmBatchLabels();
      }
    },
    getLabel(dataObject: IDataObject, inQueryIndices = false): Label {
      const { dataObjects, labels, queryIndices } = this;
      const { uuid } = dataObject;
      const idx = inQueryIndices
        ? queryIndices.find((d: number) => dataObjects[d].uuid === uuid)
        : dataObjects.findIndex((d: IDataObject) => d.uuid === uuid);
      console.assert(idx !== undefined && idx >= 0, `Data object not found: uuid = ${uuid}`);
      return labels[idx];
    },
    onClickAddClassOption(className: string): void {
      this.pushClasses(className);
    },
    async onClickConfirmBatchLabels(): Promise<void> {
      await this.sampleDataObjectsAlgorithmic();
      if (this.queryIndices.length === 0) {
        this.setMessage({
          content: 'All Data Objects Labeled.',
          type: MessageType.success,
        });
      } else {
        await this.updateModel();
        await this.assignDefaultLabels();
      }
    },
    onClickSetBatchLabels(label: Label): void {
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
