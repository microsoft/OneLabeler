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
import { ProjectDefinition, validate, WorkMode } from '../TheNavBarView/load-project';
import { setWorkMode } from '../../commons/utils';

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
  emits: { 'set:workflow': null, 'set:message': null },
  methods: {
    ...mapActions(['resetState']),
    ...mapActions(['setProject']),
    ...mapActions(['setMessage']),
    ...mapActions('workflow', ['setGraph', 'setCurrentNode']),
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

      if (!validate(projectDef.projectData)) {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.setMessage(message);
        // eslint-disable-next-line
        window.alert('Fail to load project data');
        return;
      }

      // Project data must be set first to show data correctly.
      await this.setProject(projectDef.projectData);
      this.setMessage({
        content: 'Project Progress Uploaded.',
        type: MessageType.Success,
      });

      this.setCurrentNode(null);
      const succeed = await this.onSetWorkflow(projectDef.workflow);
      if (!succeed) {
        // eslint-disable-next-line
        window.alert('Fail to load workflow');
        return;
      }

      window.projectContext = {
        projectFile: projectFile.path,
        sourcePath: projectDef.sourcePath,
      };

      setWorkMode(WorkMode.Labeling);
      this.$emit('set:workflow');
    },
  },
});
</script>
