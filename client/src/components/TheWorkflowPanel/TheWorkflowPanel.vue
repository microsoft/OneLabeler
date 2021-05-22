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

      <v-divider
        class="app-header-divider"
        vertical
      />

      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn
            class="subtitle-1 text-none px-1"
            color="white"
            plain
            tile
            v-on="on"
          >
            <v-icon
              class="pr-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.diagram
            </v-icon>
            Templates
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="({ label, value }, i) in templates"
            :key="i"
            style="min-height: 30px"
            @click="onClickTemplate(value)"
          >
            <v-list-item-title
              height="20"
              class="subtitle-2 pa-0 ma-0"
              style="height: 20px"
            >
              {{ label }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-divider
        class="app-header-divider"
        vertical
      />

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
import { DefinedError } from 'ajv';
import {
  IMessage,
  MessageType,
  WorkflowGraph,
} from '@/commons/types';
import { saveJsonFile, loadJsonFile } from '@/plugins/json-utils';
import imageClassificationIML from '@/commons/workflow-templates/image-classification-iml';
import imageClassificationMinimal from '@/commons/workflow-templates/image-classification-minimal';
import imageSegmentationMinimal from '@/commons/workflow-templates/image-segmentation-minimal';
import textClassificationMinimal from '@/commons/workflow-templates/text-classification-minimal';
import VUploadButton from '../VUploadButton/VUploadButton.vue';
import TheWorkflowGraphView from '../TheWorkflowGraphView/TheWorkflowGraphView.vue';
import {
  JsonGraph,
  JsonGraphToWorkflowGraph,
  validate,
} from './load-workflow';

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
  name: 'TheWorkflowPanel',
  components: {
    VUploadButton,
    TheWorkflowGraphView,
  },
  data() {
    return {
      templates: [
        { label: 'Image Classification Minimal', value: imageClassificationMinimal },
        { label: 'Image Classification with IML', value: imageClassificationIML },
        { label: 'Image Segmentation Minimal', value: imageSegmentationMinimal },
        { label: 'Text Classification Minimal', value: textClassificationMinimal },
      ],
    };
  },
  computed: {
    ...mapState('workflow', ['nodes', 'edges']),
  },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'setGraph',
      'resetGraph',
    ]),
    onClickExport(): void {
      const { nodes, edges } = this;
      saveJsonFile({ nodes, edges }, 'workflow.config.json');
    },
    onClickReset(): void {
      // reset workflow configurations
      this.resetGraph();
    },
    onClickTemplate(template: WorkflowGraph): void {
      this.setGraph(template);
    },
    onClickClose(): void {
      this.$emit('click:close');
    },
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const jsonGraph = await loadJsonFile(file);
      if (validate(jsonGraph)) {
        const workflowGraph = JsonGraphToWorkflowGraph(
          jsonGraph as JsonGraph,
        );
        this.setGraph(workflowGraph);
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
