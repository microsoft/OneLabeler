<template>
  <v-card
    class="rounded-0"
    style="display: flex; flex-direction: column;"
  >
    <div
      class="app-header"
      style="display: flex; align-items: center; height: 35px;"
    >
      <div class="app-header-logo px-2">
        OneLabeler
      </div>

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

      <!-- The export labeling result button. -->
      <v-btn
        title="Compile Labeling Tool Installer (takes a few minutes!)"
        color="white"
        icon
        tile
        small
        @click="onClickCompile"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.hammer
        </v-icon>
      </v-btn>

      <!-- The configuration reset button. -->
      <v-btn
        title="Reset Settings"
        color="white"
        icon
        tile
        small
        @click="resetGraph()"
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
            v-for="(template, i) in templates"
            :key="i"
            style="min-height: 30px"
            @click="setGraph(template)"
          >
            <v-list-item-title
              height="20"
              class="subtitle-2 pa-0 ma-0"
              style="height: 20px"
            >
              {{ template.label }}
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
        @click="$emit('click:close')"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.close
        </v-icon>
      </v-btn>
    </div>
    <TheWorkflowGraphView
      class="pa-2 subtitle-2"
      style="flex: 1 1 auto"
    />
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
import { saveJsonFile, parseJsonFile } from '@/plugins/file';
import templates from '@/builtins/workflow-templates/index';
import compile from '@/services/compile-api';
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
    return { templates };
  },
  computed: {
    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'setGraph',
      'resetGraph',
    ]),
    onClickExport(): void {
      saveJsonFile(this.workflow, 'workflow.config.json');
    },
    async onClickCompile(): Promise<void> {
      await compile(this.workflow);
    },
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const jsonGraph = await parseJsonFile(file);
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
