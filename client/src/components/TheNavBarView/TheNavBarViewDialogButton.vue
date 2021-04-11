<template>
  <VDialogButton
    max-width="1400px"
    :button-icon="$vuetify.icons.values.config"
    button-text="Workflow"
  >
    <template #dialog-header-title>
      <span
        class="title"
        style="user-select: none"
      >
        Workflow Configuration
      </span>

      <!-- The configuration upload button. -->
      <VUploadButton
        title="Open Configuration File"
        type="file"
        color="grey"
        small
        :icon="$vuetify.icons.values.open"
        @upload-file="onUploadFile"
      />

      <!-- The configuration export button. -->
      <v-btn
        title="Export Configuration"
        color="grey"
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
        color="grey"
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
    </template>

    <!-- The configuration menus. -->
    <template #dialog-body>
      <TheWorkflowView />
    </template>
  </VDialogButton>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
import {
  DefaultLabelingMethodType,
  IMessage,
  MessageType,
  LabelTaskType,
  SamplingStrategyType,
} from '@/commons/types';
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import VDialogButton from './VDialogButton.vue';
import VUploadButton from './VUploadButton.vue';
import TheWorkflowView from '../TheWorkflowView/TheWorkflowView.vue';

type WorkflowConfigData = {
  samplingStrategy: SamplingStrategyType,
  nBatch: number,
  defaultLabelingMethod: DefaultLabelingMethodType,
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
  name: 'TheNavBarViewDialogButton',
  components: {
    VDialogButton,
    VUploadButton,
    TheWorkflowView,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  computed: {
    ...mapState('workflow', [
      'samplingStrategy',
      'showDatasetOverview',
      'defaultLabelingMethod',
      'nBatch',
      'itemsPerRow',
      'itemsPerCol',
    ]),
  },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'setSamplingStrategy',
      'setNBatch',
      'setDefaultLabelingMethod',
      'setShowDatasetOverview',
      'setItemsPerRow',
      'setItemsPerCol',
      'setLabelTasks',
      'resetState',
    ]),
    onClickExport(): void {
      const {
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      } = this;
      saveObjectAsJSONFile({
        samplingStrategy,
        showDatasetOverview,
        defaultLabelingMethod,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      }, 'workflow.config.json');
    },
    onClickReset(): void {
      // reset workflow configurations
      this.resetState();
    },
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const config = await JSONFileToObject(file);
      if (validate(config)) {
        if ('samplingStrategy' in config) {
          this.setSamplingStrategy(config.samplingStrategy);
        }
        if ('defaultLabelingMethod' in config) {
          this.setDefaultLabelingMethod(config.defaultLabelingMethod);
        }
        if ('showDatasetOverview' in config) {
          this.setShowDatasetOverview(config.showDatasetOverview);
        }
        if ('nBatch' in config) {
          this.setNBatch(config.nBatch);
        }
        if ('itemsPerRow' in config) {
          this.setItemsPerRow(config.itemsPerRow);
        }
        if ('itemsPerCol' in config) {
          this.setItemsPerCol(config.itemsPerCol);
        }
        if ('labelTasks' in config) {
          this.setLabelTasks(config.labelTasks);
        }
        this.setMessage({
          content: 'Workflow Configuration Uploaded.',
          type: MessageType.success,
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
