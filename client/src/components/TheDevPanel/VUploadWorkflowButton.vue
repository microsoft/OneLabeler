<template>
  <VUploadButton
    title="Open Workflow File"
    type="file"
    color="white"
    small
    :icon="$vuetify.icons.values.open"
    @upload:file="onUploadFile"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { DefinedError } from 'ajv';
import {
  IMessage,
  MessageType,
} from '@/commons/types';
import { parseJsonFile } from '@/plugins/file';
import VUploadButton from '../VUploadButton/VUploadButton.vue';
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
  name: 'VUploadWorkflowButton',
  components: { VUploadButton },
  methods: {
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const jsonGraph = await parseJsonFile(file);
      if (validate(jsonGraph)) {
        const workflow = JsonGraphToWorkflowGraph(
          jsonGraph as JsonGraph,
        );
        const message = {
          content: 'Workflow Configuration Uploaded.',
          type: MessageType.Success,
        };
        this.$emit('set:workflow', workflow);
        this.$emit('set:message', message);
      } else {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.$emit('set:message', message);
      }
    },
  },
});
</script>
