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

    <!-- The new project button. -->
    <VUploadButton
      title="New Label Project (Ctrl + N)"
      type="folder"
      color="white"
      small
      :icon="$vuetify.icons.values.new"
      :keyboard-trigger="keyboardTriggerNewProject"
      @upload-files="onNewProject"
    />

    <!-- The load project button. -->
    <VUploadButton
      title="Load Label Project (Ctrl + O)"
      type="file"
      color="white"
      small
      :icon="$vuetify.icons.values.open"
      :keyboard-trigger="keyboardTriggerLoadProject"
      @upload-file="onLoadProject"
    />

    <!-- The save label project button. -->
    <v-btn
      title="Save Project (Ctrl + S)"
      color="white"
      icon
      tile
      small
      :disabled="disableSaveButton"
      @click="onClickSave"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.save
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
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import { ICommand, IImage } from '@/commons/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';
import VUploadButton from './VUploadButton.vue';
import TheNavBarViewDialogButton from './TheNavBarViewDialogButton.vue';

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
  data() {
    return {
      // Ctrl + N: create new project
      keyboardTriggerNewProject: (e: KeyboardEvent) => (e.key === 'n' && e.ctrlKey),
      // Ctrl + O: load existing project
      keyboardTriggerLoadProject: (e: KeyboardEvent) => (e.key === 'o' && e.ctrlKey),
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'statuses',
      'unlabeledMark',
      'featureNames',
      'queryIndices',
      'commandHistory',
    ]),
    ...mapState('worfklow', ['nBatch']),
    disableSaveButton(): boolean {
      return this.dataObjects.length === 0;
    },
    disableResetButton(): boolean {
      return this.dataObjects.length === 0;
    },
    disableStartButton(): boolean {
      return (this.dataObjects.length === 0) || (this.queryIndices.length !== 0);
    },
    disableUndoButton(): boolean {
      return this.commandHistory.length === 0;
    },
    disableExportButton(): boolean {
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
      'setDataObjects',
      'setLabels',
      'setStatuses',
      'setUnlabeledMark',
      'setFeatureNames',
      'resetState',
      'popCommandHistory',
    ]),
    ...mapActions('workflow', [
      'extractDataObjects',
      'extractFeatures',
      'sampleDataObjectsAlgorithmic',
    ]),
    onKey(e: KeyboardEvent): void {
      // shortcut for undo: Ctrl + Z
      const { ctrlKey, key } = e;
      if (!this.disableUndoButton && key === 'z' && ctrlKey) {
        e.preventDefault();
        this.onClickUndo();
      }
      // shortcut for save: Ctrl + S
      if (!this.disableSaveButton && key === 's' && ctrlKey) {
        e.preventDefault();
        this.onClickSave();
      }
    },
    async onNewProject(files: FileList): Promise<void> {
      if (files === null || files === undefined) return;
      await this.extractDataObjects(files);
      this.extractFeatures();
    },
    async onLoadProject(file: File): Promise<void> {
      const {
        dataObjects,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      } = await JSONFileToObject(file);
      this.setDataObjects(dataObjects);
      this.setLabels(labels);
      this.setStatuses(statuses);
      this.setUnlabeledMark(unlabeledMark);
      this.setFeatureNames(featureNames);
    },
    onClickSave(): void {
      const {
        dataObjects,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      saveObjectAsJSONFile({
        dataObjects,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      }, 'project.json');
    },
    onClickReset(): void {
      // reset root store
      this.resetState();
    },
    onClickStart(): void {
      this.sampleDataObjectsAlgorithmic();
    },
    onClickUndo(): void {
      if (this.lastCommand !== null) {
        this.lastCommand.undo();
        this.popCommandHistory();
      }
    },
    onClickExport(): void {
      const { dataObjects, labels } = this;
      const labeledData = dataObjects.map((d: IImage, i: number) => {
        const pathSegments = (d.path as string).split('/');
        const filename = pathSegments[pathSegments.length - 1];
        const label = labels[i];
        return { filename, label };
      });
      saveObjectAsJSONFile(labeledData, 'labels.json');
    },
  },
});
</script>
