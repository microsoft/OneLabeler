<template>
  <VUploadWorkflowButton
    text="Start Labeling"
    style="font-size: 1.5rem; color: #3794ff;"
    @set:project="onSetProject($event)"
    @set:message="setMessage($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions } from 'vuex';
import { MessageType, IMessage } from '@/commons/types';
import { parseLocalJsonFile } from '@/plugins/file';
import { DefinedError } from 'ajv';
import { TrimmedWorkflow, parseWorkflow, validateWorkflow } from '@/commons/workflow-utils';
import VUploadWorkflowButton from '@/components/TheDevPanel/VUploadWorkflowButton.vue';
import { ProjectDefinition, validate } from '../TheNavBarView/load-project';

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
  name: 'TheButtonWorkflowAnnotate',
  components: { VUploadWorkflowButton },
  emits: { 'set:workflow': null },
  methods: {
    ...mapActions(['resetState']),
    ...mapActions(['setProject']),
    ...mapActions(['setMessage']),
    ...mapActions('workflow', ['setGraph']),
    async onSetWorkflow(jsonGraph: unknown): Promise<boolean> {
      if (validateWorkflow(jsonGraph)) {
        const workflow = parseWorkflow(
          jsonGraph as TrimmedWorkflow,
        );
        this.setGraph(workflow);
        return true;
      }

      const errors = validateWorkflow.errors as DefinedError[];
      const message = computeErrorMessage(errors[0]);
      this.$emit('set:message', message);
      return false;
    },
    async onSetProject(projectFile: File): Promise<void> {
      this.resetState();
      const projectDef = await parseLocalJsonFile(projectFile.path) as ProjectDefinition;
      const succeed = await this.onSetWorkflow(projectDef.workflow);
      if (!succeed) {
        // eslint-disable-next-line
        window.alert('Fail to load workflow');
        return;
      }

      if (validate(projectDef.projectData)) {
        this.setProject(projectDef.projectData);
        this.setMessage({
          content: 'Project Progress Uploaded.',
          type: MessageType.Success,
        });

        window.projectContext = {
          projectFile: projectFile.path,
          sourcePath: projectDef.sourcePath,
        };
        this.$emit('set:workflow');
      } else {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.setMessage(message);
        // eslint-disable-next-line
        window.alert('Fail to load project data');
      }
    },
  },
});
</script>
