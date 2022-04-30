<template>
  <VUploadWorkflowButton
    text="Open Labeling Workflow"
    style="font-size: 1.5rem; color: #3794ff;"
    @set:workflow="onSetWorkflow($event)"
    @set:message="setMessage($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions } from 'vuex';
import type { WorkflowGraph } from '@/commons/types';
import VUploadWorkflowButton from '@/components/TheDevPanel/VUploadWorkflowButton.vue';

export default defineComponent({
  name: 'TheButtonWorkflowUpload',
  components: { VUploadWorkflowButton },
  emits: { 'set:workflow': null },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', ['setGraph']),
    onSetWorkflow(workflow: WorkflowGraph): void {
      this.setGraph(workflow);
      this.$emit('set:workflow');
    },
  },
});
</script>
