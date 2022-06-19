<template>
  <VUploadWorkflowButton
    text="Modify Labeling Project"
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
import VUploadWorkflowButton from '@/components/TheDevPanel/VUploadWorkflowButton.vue';
import { TrimmedWorkflow, parseWorkflow, validateWorkflow } from '@/commons/workflow-utils';
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
  name: 'TheButtonWorkflowUpload',
  components: { VUploadWorkflowButton },
  emits: {
    'set:message': null,
    'set:workflow': null,
    'update:showStartPage': null,
  },
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

      try {
        const projectDef = await parseLocalJsonFile(projectFile.path) as ProjectDefinition;
        if (!validate(projectDef.projectData)) {
          const errors = validate.errors as DefinedError[];
          const message = computeErrorMessage(errors[0]);
          this.setMessage(message);
          // eslint-disable-next-line
          window.alert('Fail to load project data');
          return;
        }

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

        setWorkMode(WorkMode.EditProject);
        this.$emit('set:workflow');
        this.$emit('update:showStartPage', false);
      } catch (e) {
        console.log(e);
      }
    },
  },
});
</script>
