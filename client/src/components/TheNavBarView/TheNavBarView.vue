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

    <!-- The start data labeling button. -->
    <v-btn
      title="Next Batch (Enter)"
      color="white"
      icon
      tile
      small
      :disabled="disableNextBatchButton"
      @click="onClickNextBatch"
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
    <v-spacer />

    <!-- The configuration button. -->
    <TheNavBarViewDialogButton />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import {
  ICommand,
  IDataObject,
  IImage,
  IMessage,
  Label,
  ILabelMask,
  ILabelPolygon,
  MessageType,
  Status,
} from '@/commons/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';
import VUploadButton from './VUploadButton.vue';
import TheNavBarViewDialogButton from './TheNavBarViewDialogButton.vue';

type ProjectData = {
  dataObjects: IDataObject[],
  classes: Label[],
  labels: Label[],
  labelMasks: ILabelMask[],
  labelPolygons: ILabelPolygon[],
  statuses: Status[],
  unlabeledMark: Label,
  featureNames: string[],
}

const ajv = new Ajv();
const schema: JSONSchemaType<ProjectData> = {
  type: 'object',
  required: [
    'dataObjects',
    'statuses',
    'classes',
    'unlabeledMark',
    'featureNames',
  ],
  properties: {
    dataObjects: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'uuid',
          'features',
        ],
        properties: {
          uuid: { type: 'string' },
          features: {
            type: 'array',
            items: { type: 'number' },
          },
        },
        additionalProperties: true,
      },
    },
    classes: {
      type: 'array',
      items: { type: 'string' },
    },
    labels: {
      type: 'array',
      items: { type: 'string' },
    },
    labelPolygons: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'number',
            },
          },
        },
      },
    },
    labelMasks: {
      type: 'array',
      items: {
        type: 'object',
        required: [
          'path',
        ],
        properties: {
          path: { type: ['string', 'null'] },
        },
        additionalProperties: true,
      },
    },
    statuses: {
      type: 'array',
      items: { type: 'string' },
    },
    unlabeledMark: { type: 'string' },
    featureNames: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};
const validate = ajv.compile(schema);

/** Raise alert according to the error message when validation failed. */
const computeErrorMessage = (err: DefinedError): IMessage | null => {
  if (err.keyword === 'required') {
    return {
      content: `UPLOAD FAILED: ${err.message}.`,
      type: MessageType.error,
    };
  }
  if (err.keyword === 'type') {
    return {
      content: `UPLOAD FAILED: ${err.dataPath} ${err.message}.`,
      type: MessageType.error,
    };
  }
  if (err.keyword === 'additionalProperties') {
    return {
      content: `UPLOAD FAILED: ${err.message} '${err.params.additionalProperty}'.`,
      type: MessageType.error,
    };
  }
  return null;
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
      'classes',
      'labels',
      'labelPolygons',
      'labelMasks',
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
    disableNextBatchButton(): boolean {
      return this.dataObjects.length === 0;
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
      'setClasses',
      'setLabels',
      'setLabelPolygons',
      'setLabelMasks',
      'setMessage',
      'setStatuses',
      'setUnlabeledMark',
      'setFeatureNames',
      'resetState',
      'popCommandHistory',
    ]),
    ...mapActions('workflow', [
      'extractDataObjects',
      'extractFeatures',
      'updateModel',
      'sampleDataObjectsAlgorithmic',
      'assignDefaultLabels',
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
      // shortcut for next batch: Enter
      if (!this.disableNextBatchButton && key === 'Enter') {
        e.preventDefault();
        this.onClickNextBatch();
      }
    },
    async onNewProject(files: FileList): Promise<void> {
      if (files === null || files === undefined) return;
      await this.extractDataObjects(files);
      await this.extractFeatures();
      this.setMessage({
        content: 'Project Data Uploaded.',
        type: MessageType.success,
      });
    },
    async onLoadProject(file: File): Promise<void> {
      const data = await JSONFileToObject(file);
      if (validate(data)) {
        const {
          dataObjects,
          classes,
          labels,
          labelPolygons,
          labelMasks,
          statuses,
          unlabeledMark,
          featureNames,
        } = data as ProjectData;
        this.setDataObjects(dataObjects);
        this.setClasses(classes);
        this.setLabels(labels);
        this.setLabelPolygons(labelPolygons);
        this.setLabelMasks(labelMasks);
        this.setStatuses(statuses);
        this.setUnlabeledMark(unlabeledMark);
        this.setFeatureNames(featureNames);
        this.setMessage({
          content: 'Project Progress Uploaded.',
          type: MessageType.success,
        });
      } else {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.setMessage(message);
      }
    },
    onClickSave(): void {
      const {
        dataObjects,
        classes,
        labels,
        labelPolygons,
        labelMasks,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      const projectData: ProjectData = {
        dataObjects,
        classes,
        labels,
        labelPolygons,
        labelMasks,
        statuses,
        unlabeledMark,
        featureNames,
      };
      saveObjectAsJSONFile(projectData, 'project.json');
    },
    onClickReset(): void {
      // reset root store
      this.resetState();
    },
    async onClickNextBatch(): Promise<void> {
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
