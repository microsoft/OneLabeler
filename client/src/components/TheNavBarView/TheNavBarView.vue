<template>
  <v-toolbar
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
      @upload:files="onNewProject"
    />

    <!-- The load project button. -->
    <VUploadButton
      title="Load Label Project (Ctrl + O)"
      type="file"
      color="white"
      small
      :icon="$vuetify.icons.values.open"
      :keyboard-trigger="keyboardTriggerLoadProject"
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

    <template v-if="dataObjectSelectionAlgorithmicEnabled">
      <!-- The start data labeling button. -->
      <v-btn
        title="Next Batch (Ctrl + ->)"
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
    </template>
    <v-spacer />

    <!-- The configuration button. -->
    <TheNavBarViewDialogButton />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import {
  ICommand,
  IDataObject,
  IImage,
  IMessage,
  Label,
  ILabelMask,
  ILabelGeometricObject,
  MessageType,
  Status,
  Process,
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
  labelGeometricObjects: ILabelGeometricObject[][],
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
    labelGeometricObjects: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: [
            'label',
            'shape',
            'position',
          ],
          properties: {
            label: { type: 'string' },
            shape: { type: 'string' },
            position: { type: 'array' },
          },
          additionalProperties: true,
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
    ...mapGetters('workflow', [
      'featureExtractionMethod',
      'defaultLabelingMethod',
      'interimModelTrainingMethod',
      'dataObjectSelectionMethod',
    ]),
    ...mapState([
      'dataObjects',
      'classes',
      'labels',
      'labelGeometricObjects',
      'labelMasks',
      'statuses',
      'unlabeledMark',
      'featureNames',
      'queryIndices',
      'commandHistory',
    ]),
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
    dataObjectSelectionAlgorithmicEnabled(): boolean {
      return (this.dataObjectSelectionMethod as Process[])
        .findIndex((d) => d.isAlgorithmic) >= 0;
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
      'setDataObjects',
      'setClasses',
      'setLabels',
      'setLabelGeometricObjects',
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
      'executeFeatureExtraction',
      'executeInterimModelTraining',
      'executeDataObjectSelectionAlgorithmic',
      'executeDefaultLabeling',
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
      if (!this.disableNextBatchButton && key === 'ArrowRight' && ctrlKey) {
        if (this.dataObjectSelectionAlgorithmicEnabled) {
          e.preventDefault();
          this.onClickNextBatch();
        }
      }
    },
    async onNewProject(files: FileList): Promise<void> {
      if (files === null || files === undefined) return;
      await this.extractDataObjects(files);
      await this.executeFeatureExtraction(this.featureExtractionMethod);
      this.setMessage({
        content: 'Project Data Uploaded.',
        type: MessageType.Success,
      });
    },
    async onLoadProject(file: File): Promise<void> {
      const data = await JSONFileToObject(file);
      if (validate(data)) {
        const {
          dataObjects,
          classes,
          labels,
          labelGeometricObjects,
          labelMasks,
          statuses,
          unlabeledMark,
          featureNames,
        } = data as ProjectData;
        this.setDataObjects(dataObjects);
        this.setClasses(classes);
        this.setLabels(labels);
        this.setLabelGeometricObjects(labelGeometricObjects);
        this.setLabelMasks(labelMasks);
        this.setStatuses(statuses);
        this.setUnlabeledMark(unlabeledMark);
        this.setFeatureNames(featureNames);
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
    onClickSave(): void {
      const {
        dataObjects,
        classes,
        labels,
        labelGeometricObjects,
        labelMasks,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      const projectData: ProjectData = {
        dataObjects,
        classes,
        labels,
        labelGeometricObjects,
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
      await this.executeDataObjectSelectionAlgorithmic(
        this.dataObjectSelectionMethod.find((d) => d.algorithmic),
      );
      if (this.queryIndices.length === 0) {
        this.setMessage({
          content: 'All Data Objects Labeled.',
          type: MessageType.Success,
        });
      } else {
        await this.executeInterimModelTraining(
          this.interimModelTrainingMethod,
        );
        await this.executeDefaultLabeling(
          this.defaultLabelingMethod,
        );
      }
    },
    onClickUndo(): void {
      if (this.lastCommand !== null) {
        this.lastCommand.undo();
        this.popCommandHistory();
      }
    },
    onClickExport(): void {
      const {
        dataObjects,
        labels,
        labelGeometricObjects,
        labelMasks,
      } = this;
      const labeledData = dataObjects.map((d: IImage, i: number) => {
        const pathSegments = (d.path as string).split('/');
        const filename = pathSegments[pathSegments.length - 1];
        return {
          filename,
          label: labels[i],
          labelGeometricObjects: labelGeometricObjects[i],
          labelMask: labelMasks[i],
        };
      });
      saveObjectAsJSONFile(labeledData, 'labels.json');
    },
  },
});
</script>
