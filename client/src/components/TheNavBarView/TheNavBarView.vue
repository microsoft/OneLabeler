<template>
  <div
    class="app-header pl-1"
    :style="{
      'display': 'flex',
      'align-items': 'center',
      'height': `${height}px`,
    }"
  >
    <!-- The new project button. -->
    <VUploadButton
      v-if="showFileUploadButton && uploadType !== null"
      :type="uploadType"
      :disabled="disableNewProjectButton"
      :icon="$vuetify.icons.values.new"
      :keyboard-trigger="(showFileUploadButton && !disableNewProjectButton)
        ? keyboardTriggerNewProject
        : null"
      title="New Label Project (Ctrl + P)"
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
    <!--
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
    -->

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

    <!-- The data management dialog button -->
    <TheNavBarViewDataManagementDialogButton />

    <!-- The dashboard dialog button. -->
    <TheNavBarViewDashboardDialogButton />

    <!-- The workflow dialog button. -->
    <v-btn
      v-if="isDeveloperMode"
      class="app-header-button mr-1 text-none subtitle-1"
      title="Workflow"
      @click="onClickWorkflowButton"
    >
      <v-icon
        class="pr-1"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.config
      </v-icon>
      Workflow
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { DefinedError } from 'ajv';
import { saveJsonFile, parseJsonFile } from '@/plugins/file';
import {
  DataType,
  ICommand,
  IMessage,
  MessageType,
  SourceType,
  UploadTarget,
  DockSideType,
} from '@/commons/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';
import dataTypeSetups from '@/builtins/data-types/index';
import VUploadButton from '../VUploadButton/VUploadButton.vue';
import TheNavBarViewDashboardDialogButton from './TheNavBarViewDashboardDialogButton.vue';
import TheNavBarViewDataManagementDialogButton from './TheNavBarViewDataManagementDialogButton.vue';
import { ProjectData, validate } from './load-project';
import exportLabels from './export-labels';

const isDeveloperMode = process.env.VUE_APP_USER_TYPE === 'DEVELOPER';

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
    TheNavBarViewDataManagementDialogButton,
  },
  props: {
    height: {
      default: 35,
      type: Number,
    },
  },
  data() {
    return {
      isDeveloperMode,
      nDataObjects: 0,
      DataType,
      // Ctrl + P: create new project
      keyboardTriggerNewProject: (e: KeyboardEvent) => (e.key === 'p' && e.ctrlKey),
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
      'categoryTasks',
      'unlabeledMark',
      'featureNames',
      'commandHistory',
      'sourceService',
      'dockSide',
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
      return (this.currentNode === null || this.nDataObjects === 0)
        && (this.sourceService.type !== SourceType.ServerDB);
    },
    disableUndoButton(): boolean {
      return this.commandHistory.length === 0;
    },
    disableExportButton(): boolean {
      return this.nDataObjects === 0;
    },
    showFileUploadButton(): boolean {
      return this.sourceService.type === SourceType.FileUpload;
    },
    showExecutionButton(): boolean {
      return this.currentNode !== null
        || this.sourceService.type === SourceType.ServerDB;
    },
    uploadType(): UploadTarget | null {
      const dataType = this.dataType as DataType | null;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      return dataTypeSetup?.importType ?? null;
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
      'setDockSide',
    ]),
    ...mapActions('workflow', [
      'executeRegisterStorage',
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
      await this.executeRegisterStorage();
      await this.executeDataObjectExtraction(input);
      this.setMessage({
        content: 'Project Data Uploaded.',
        type: MessageType.Success,
      });
      if (this.startNode === null) return;
      await this.executeWorkflow(this.startNode);
    },
    async onLoadProject(file: File): Promise<void> {
      const data = await parseJsonFile(file);
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
        categoryTasks,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      const projectData: ProjectData = {
        dataObjects: await dataObjects.getAll(),
        classes,
        categoryTasks,
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
      if (this.nextNodes === null) {
        await this.executeRegisterStorage();
        this.setMessage({
          content: 'Project Data Uploaded.',
          type: MessageType.Success,
        });
        await this.executeWorkflow(this.startNode);
        return;
      }
      if (this.nextNodes.length !== 1) return;
      await this.executeWorkflow(this.nextNodes[0]);
    },
    onClickUndo(): void {
      if (this.lastCommand !== null) {
        this.lastCommand.undo();
        this.popCommandHistory();
      }
    },
    async onClickExport(): Promise<void> {
      await exportLabels(
        this.dataObjects,
        this.labels,
        this.dataType,
      );
    },
    onClickWorkflowButton(): void {
      const updatedDockSide = this.dockSide === DockSideType.HIDE
        ? DockSideType.WINDOW
        : DockSideType.HIDE;
      this.setDockSide(updatedDockSide);
    },
  },
});
</script>
