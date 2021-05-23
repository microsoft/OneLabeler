<template>
  <v-toolbar
    class="app-header"
    :height="height"
  >
    <v-toolbar-title class="app-header-logo pl-2 pr-2">
      Generic Labeler
    </v-toolbar-title>

    <v-divider
      class="app-header-divider"
      vertical
    />

    <!-- The new project button. -->
    <VUploadButton
      :type="dataType === DataType.Image ? 'folder' : 'file'"
      :disabled="disableNewProjectButton"
      :icon="$vuetify.icons.values.new"
      :keyboard-trigger="keyboardTriggerNewProject"
      title="New Label Project (Ctrl + N)"
      color="white"
      small
      @upload:file="onNewProject"
      @upload:files="onNewProject"
    />

    <!-- The load project button. -->
    <VUploadButton
      :icon="$vuetify.icons.values.open"
      :keyboard-trigger="keyboardTriggerLoadProject"
      title="Load Label Project (Ctrl + O)"
      type="file"
      color="white"
      small
      @upload:file="onLoadProject"
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

    <template v-if="showExecutionButton">
      <!-- The start data labeling button. -->
      <v-btn
        title="Submit (Ctrl + ->)"
        color="white"
        icon
        tile
        small
        :disabled="disableExecutionButton"
        @click="onClickExecution"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.start
        </v-icon>
      </v-btn>

      <v-divider
        class="app-header-divider"
        vertical
      />
    </template>
    <v-spacer />

    <!-- The dashboard dialog button. -->
    <TheNavBarViewDashboardDialogButton />

    <!-- The workflow dialog button. -->
    <TheNavBarViewWorkflowDialogButton />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { DefinedError } from 'ajv';
import { saveJsonFile, loadJsonFile } from '@/plugins/json-utils';
import {
  DataType,
  ICommand,
  IDataObject,
  ILabel,
  IImage,
  IText,
  IMessage,
  MessageType,
} from '@/commons/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';
import VUploadButton from '../VUploadButton/VUploadButton.vue';
import TheNavBarViewDashboardDialogButton from './TheNavBarViewDashboardDialogButton.vue';
import TheNavBarViewWorkflowDialogButton from './TheNavBarViewWorkflowDialogButton.vue';
import { ProjectData, validate } from './load-project';

/** Raise alert according to the error message when validation failed. */
const computeErrorMessage = (err: DefinedError): IMessage | null => {
  if (err.keyword === 'required') {
    return {
      content: `UPLOAD FAILED: ${err.message}.`,
      type: MessageType.Error,
    };
  }
  if (err.keyword === 'type') {
    return {
      content: `UPLOAD FAILED: ${err.dataPath} ${err.message}.`,
      type: MessageType.Error,
    };
  }
  if (err.keyword === 'additionalProperties') {
    return {
      content: `UPLOAD FAILED: ${err.message} '${err.params.additionalProperty}'.`,
      type: MessageType.Error,
    };
  }
  return null;
};

export default Vue.extend({
  name: 'TheNavBarView',
  components: {
    VUploadButton,
    TheNavBarViewDashboardDialogButton,
    TheNavBarViewWorkflowDialogButton,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  data() {
    return {
      nDataObjects: 0,
      DataType,
      // Ctrl + N: create new project
      keyboardTriggerNewProject: (e: KeyboardEvent) => (e.key === 'n' && e.ctrlKey),
      // Ctrl + O: load existing project
      keyboardTriggerLoadProject: (e: KeyboardEvent) => (e.key === 'o' && e.ctrlKey),
    };
  },
  computed: {
    ...mapGetters('workflow', [
      'dataType',
      'startNode',
      'nextNodes',
    ]),
    ...mapState('workflow', [
      'currentNode',
    ]),
    ...mapState([
      'dataObjects',
      'labels',
      'statuses',
      'classes',
      'unlabeledMark',
      'featureNames',
      'commandHistory',
    ]),
    disableNewProjectButton(): boolean {
      const dataType = this.dataType as DataType | null;
      return dataType === null;
    },
    disableSaveButton(): boolean {
      return this.nDataObjects === 0;
    },
    disableResetButton(): boolean {
      return this.nDataObjects === 0;
    },
    disableExecutionButton(): boolean {
      return this.currentNode === null
        || this.nDataObjects === 0;
    },
    disableUndoButton(): boolean {
      return this.commandHistory.length === 0;
    },
    disableExportButton(): boolean {
      return this.nDataObjects === 0;
    },
    showExecutionButton(): boolean {
      return this.currentNode !== null;
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
  watch: {
    async dataObjects() {
      const { dataObjects } = this;
      this.nDataObjects = dataObjects === null
        ? 0
        : await dataObjects.count();
    },
  },
  created(): void {
    // Bind keyboard events.
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // Remove listener before distroy,
    // otherwise the onKey method will be called multiple times.
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    ...mapActions([
      'popCommandHistory',
      'resetState',
      'setMessage',
      'setProject',
    ]),
    ...mapActions('workflow', [
      'executeDataObjectExtraction',
      'executeWorkflow',
    ]),
    onKey(e: KeyboardEvent): void {
      const { ctrlKey, key } = e;
      // shortcut for undo: Ctrl + Z
      if (!this.disableUndoButton && key === 'z' && ctrlKey) {
        e.preventDefault();
        this.onClickUndo();
      }
      // shortcut for save: Ctrl + S
      if (!this.disableSaveButton && key === 's' && ctrlKey) {
        e.preventDefault();
        this.onClickSave();
      }
      // shortcut for next batch: Ctrl + ArrowRight
      if (!this.disableExecutionButton && key === 'ArrowRight' && ctrlKey) {
        if (this.showExecutionButton) {
          e.preventDefault();
          this.onClickExecution();
        }
      }
    },
    async onNewProject(input: File | FileList): Promise<void> {
      if (input === null || input === undefined) return;
      await this.executeDataObjectExtraction(input);
      this.setMessage({
        content: 'Project Data Uploaded.',
        type: MessageType.Success,
      });
      if (this.startNode === null) return;
      await this.executeWorkflow(this.startNode);
    },
    async onLoadProject(file: File): Promise<void> {
      const data = await loadJsonFile(file);
      if (validate(data)) {
        this.setProject(data as ProjectData);
        this.setMessage({
          content: 'Project Progress Uploaded.',
          type: MessageType.Success,
        });
      } else {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.setMessage(message);
      }
    },
    async onClickSave(): Promise<void> {
      const {
        dataObjects,
        classes,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      const projectData: ProjectData = {
        dataObjects: await dataObjects.getAll(),
        classes,
        labels: await labels.getAll(),
        statuses: await statuses.getAll(),
        unlabeledMark,
        featureNames: featureNames.length === 0
          ? undefined : featureNames,
      };
      saveJsonFile(projectData, 'project.json');
    },
    onClickReset(): void {
      // reset root store
      this.resetState();
    },
    async onClickExecution(): Promise<void> {
      if (this.nextNodes === null || this.nextNodes.length !== 1) return;
      await this.executeWorkflow(this.nextNodes[0]);
    },
    onClickUndo(): void {
      if (this.lastCommand !== null) {
        this.lastCommand.undo();
        this.popCommandHistory();
      }
    },
    async onClickExport(): Promise<void> {
      const dataObjects = (await this.dataObjects.getAll()) as IDataObject[];
      const labels = (await this.labels.getAll()) as ILabel[];
      const uuid2idxInLabels: Record<string, number> = {};
      labels.forEach((d: ILabel, i) => {
        uuid2idxInLabels[d.uuid] = i;
      });
      const dataType = this.dataType as DataType;
      if (dataType === DataType.Image) {
        const labeledData = dataObjects.map((d: IImage, i: number) => {
          const pathSegments = (d.path as string).split('/');
          const filename = pathSegments[pathSegments.length - 1];
          return {
            filename,
            category: labels === null ? undefined : labels[i].category,
            shapes: labels === null ? undefined : labels[i].shapes,
            mask: labels === null ? undefined : labels[i].mask,
          };
        });
        saveJsonFile(labeledData, 'labels.json');
      } else if (dataType === DataType.Text) {
        const labeledData = (dataObjects as IText[]).map((d: IText) => {
          const result: { uuid: string, content: string, category?: string } = {
            uuid: d.uuid,
            content: d.content,
          };
          const idx = uuid2idxInLabels[d.uuid];
          if (idx !== undefined) {
            result.category = labels[idx].category;
          }
          return result;
        });
        saveJsonFile(labeledData, 'labels.json');
      }
    },
  },
});
</script>
