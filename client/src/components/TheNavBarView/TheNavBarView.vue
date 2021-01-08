<template>
  <v-toolbar
    dense
    class="app-header"
    :height="height"
  >
    <v-toolbar-title class="app-header-logo pl-2 pr-2">
      Image Labeler
    </v-toolbar-title>
    <v-divider
      class="app-header-divider"
      vertical
    />

    <!-- The upload data source button. -->
    <VUploadButton
      title="Open Image Folder (Ctrl+O)"
      type="folder"
      color="white"
      small
      keyboard-shortcut
      @upload-files="onUploadFiles"
    />

    <!-- The start data labeling button. -->
    <v-btn
      title="Start"
      color="white"
      icon
      tile
      small
      :disabled="disableStartButton"
      @click="onClickStart"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.start
      </v-icon>
    </v-btn>

    <!-- The undo label editing button. -->
    <v-btn
      :title="`Undo ${lastCommandName} (Ctrl + Z)`"
      color="white"
      icon
      tile
      small
      :disabled="disableUndoButton"
      @click="onClickUndo"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.undo
      </v-icon>
    </v-btn>

    <!-- The export labeling result button. -->
    <v-btn
      title="Export Labels"
      color="white"
      icon
      tile
      small
      :disabled="disableExportButton"
      @click="onClickExport"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.export
      </v-icon>
    </v-btn>

    <!-- The reset dataset button. -->
    <v-btn
      title="Reset Dataset"
      color="white"
      icon
      tile
      small
      :disabled="disableResetButton"
      @click="onClickReset"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.reset
      </v-icon>
    </v-btn>

    <v-divider
      class="app-header-divider"
      vertical
    />
    <v-spacer />

    <!-- The configuration button. -->
    <TheNavBarViewDialogButton />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { saveAs } from 'file-saver';
import { ICommand, IImage, Label } from '@/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';
import VUploadButton from './VUploadButton.vue';
import TheNavBarViewDialogButton from './TheNavBarViewDialogButton.vue';

const exportLabeledData = (dataObjects: IImage[], labels: Label[]) => {
  const labeledData = dataObjects.map((d: IImage, i) => {
    const pathSegments = (d.path as string).split('/');
    const filename = pathSegments[pathSegments.length - 1];
    const label = labels[i];
    return { filename, label };
  });
  const json = JSON.stringify(labeledData);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, 'labels.json');
};

export default Vue.extend({
  name: 'TheNavBarView',
  components: {
    VUploadButton,
    TheNavBarViewDialogButton,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  computed: {
    ...mapState(['dataObjects', 'labels', 'queryIndices', 'nBatch', 'commandHistory']),
    disableStartButton(): boolean {
      return (this.dataObjects.length === 0) || (this.queryIndices.length !== 0);
    },
    disableUndoButton(): boolean {
      return this.commandHistory.length === 0;
    },
    disableExportButton(): boolean {
      return this.dataObjects.length === 0;
    },
    disableResetButton(): boolean {
      return this.dataObjects.length === 0;
    },
    lastCommand(): ICommand | null {
      if (this.commandHistory.length === 0) {
        return null;
      }
      return this.commandHistory[this.commandHistory.length - 1];
    },
    lastCommandName(): string {
      if (this.lastCommand === null) {
        return '';
      }
      if (this.lastCommand instanceof EditBatchCommand) {
        return 'Edit Batch';
      }
      if (this.lastCommand instanceof EditSingleCommand) {
        return 'Edit Single';
      }
      return '';
    },
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
      'resetState',
      'extractDataObjects',
      'extractFeatures',
      'sampleDataObjects',
      'popCommandHistory',
    ]),
    onKey(e: KeyboardEvent): void {
      // shortcut for undo: ctrl + z
      const { ctrlKey, key } = e;
      if (key === 'z' && ctrlKey) {
        this.onClickUndo();
      }
    },
    onClickStart(): void {
      this.sampleDataObjects();
    },
    onClickUndo(): void {
      if (this.lastCommand !== null) {
        this.lastCommand.undo();
        this.popCommandHistory();
      }
    },
    onClickExport(): void {
      const { dataObjects, labels } = this;
      exportLabeledData(dataObjects, labels);
    },
    onClickReset(): void {
      // reset root store
      this.resetState();
    },
    async onUploadFiles(files: FileList): Promise<void> {
      if (files === null || files === undefined) return;
      await this.extractDataObjects(files);
      this.extractFeatures();
    },
  },
});
</script>
