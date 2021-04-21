<template>
  <v-card class="rounded-0">
    <v-toolbar
      class="app-header"
      height="35"
    >
      <v-toolbar-title class="app-header-logo pl-2 pr-2">
        Workflow Configuration
      </v-toolbar-title>

      <v-divider
        class="app-header-divider"
        vertical
      />

      <!-- The configuration upload button. -->
      <VUploadButton
        title="Open Configuration File"
        type="file"
        color="white"
        small
        :icon="$vuetify.icons.values.open"
        @upload:file="onUploadFile"
      />

      <!-- The configuration export button. -->
      <v-btn
        title="Export Configuration"
        color="white"
        icon
        tile
        small
        @click="onClickExport"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.save
        </v-icon>
      </v-btn>

      <!-- The configuration reset button. -->
      <v-btn
        title="Reset Settings"
        color="white"
        icon
        tile
        small
        @click="onClickReset"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.reset
        </v-icon>
      </v-btn>

      <v-spacer />

      <v-btn
        class="mr-1"
        title="Close"
        color="white"
        icon
        tile
        small
        @click="onClickClose"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.close
        </v-icon>
      </v-btn>

    </v-toolbar>
    <v-card-text class="px-2 py-2">
      <TheWorkflowGraphView />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
import {
  DefaultLabelingMethod,
  IMessage,
  MessageType,
  LabelTaskType,
} from '@/commons/types';
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import VUploadButton from './VUploadButton.vue';
import TheWorkflowGraphView from '../TheWorkflowGraphView/TheWorkflowGraphView.vue';

type WorkflowConfigData = {
  nBatch: number,
  defaultLabelingMethod: DefaultLabelingMethod,
  showDatasetOverview: boolean,
  itemsPerRow: number,
  itemsPerCol: number,
  labelTasks: LabelTaskType[],
}

const ajv = new Ajv();
const schema: JSONSchemaType<Partial<WorkflowConfigData>> = {
  type: 'object',
  properties: {
    samplingStrategy: { type: 'string' },
    nBatch: { type: 'integer' },
    defaultLabelingMethod: { type: 'string' },
    showDatasetOverview: { type: 'boolean' },
    itemsPerRow: { type: 'integer' },
    itemsPerCol: { type: 'integer' },
    labelTasks: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  additionalProperties: false,
};
const validate = ajv.compile(schema);

/** Compute alert message according to the error message when validation failed. */
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
  name: 'TheNavBarViewDialogButton',
  components: {
    VUploadButton,
    TheWorkflowGraphView,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  computed: {
    ...mapState('workflow', [
      'defaultLabelingMethod',
    ]),
  },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'setDefaultLabelingMethod',
      'setLabelTasks',
      'resetState',
    ]),
    onClickExport(): void {
      const {
        defaultLabelingMethod,
      } = this;
      saveObjectAsJSONFile({
        defaultLabelingMethod,
      }, 'workflow.config.json');
    },
    onClickReset(): void {
      // reset workflow configurations
      this.resetState();
    },
    onClickClose(): void {
      this.$emit('click:close');
    },
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const config = await JSONFileToObject(file);
      if (validate(config)) {
        if ('defaultLabelingMethod' in config) {
          this.setDefaultLabelingMethod(config.defaultLabelingMethod);
        }
        if ('labelTasks' in config) {
          this.setLabelTasks(config.labelTasks);
        }
        this.setMessage({
          content: 'Workflow Configuration Uploaded.',
          type: MessageType.Success,
        });
      } else {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.setMessage(message);
      }
    },
  },
});
</script>
