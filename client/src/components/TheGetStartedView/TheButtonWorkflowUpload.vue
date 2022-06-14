<template>
  <VUploadWorkflowButton
    text="Modify Labeling Project"
    style="font-size: 1.5rem; color: #3794ff;"
    @set:project="onSetWorkflow($event)"
    @set:message="setMessage($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions } from 'vuex';
import { MessageType, IMessage } from '@/commons/types';
import { getWorkflowFileFromProjectFile, parseLocalJsonFile } from '@/plugins/file';
import { DefinedError } from 'ajv';
import VUploadWorkflowButton from '@/components/TheDevPanel/VUploadWorkflowButton.vue';
import { TrimmedWorkflow, parseWorkflow, validateWorkflow } from '@/commons/workflow-utils';
// import { ProjectData, validate } from '../TheNavBarView/load-project';

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
      content: `UPLOAD FAILED: ${err.message}.`,
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

export default defineComponent({
  name: 'TheButtonWorkflowUpload',
  components: { VUploadWorkflowButton },
  emits: {
    'set:workflow': null,
    'update:showStartPage': null,
  },
  methods: {
    ...mapActions(['resetState']),
    ...mapActions(['setProject']),
    ...mapActions(['setMessage']),
    ...mapActions('workflow', ['setGraph']),
    async onSetWorkflow(projectFile: File): Promise<void> {
      this.resetState();
      const workflowFile = getWorkflowFileFromProjectFile(projectFile.path);
      const jsonGraph = await parseLocalJsonFile(workflowFile);
      if (validateWorkflow(jsonGraph)) {
        const workflow = parseWorkflow(
          jsonGraph as TrimmedWorkflow,
        );
        this.setGraph(workflow);
        this.$emit('set:workflow');
        this.$emit('update:showStartPage', false);
      }
    },
  },
});
</script>
