<template>
  <VUploadButton
    v-if="shown && uploadType !== null"
    :type="uploadType"
    :disabled="disabled"
    :icon="$vuetify.icons.values.new"
    :keyboard-trigger="(shown && !disabled)
      ? keyboardTrigger
      : null"
    title="New Label Project (Ctrl + P)"
    color="white"
    small
    @upload:file="onNewProject"
    @upload:files="onNewProject"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  DataType,
  MessageType,
  SourceType,
} from '@/commons/types';
import type { UploadTarget } from '@/commons/types';
import dataTypeSetups from '@/builtins/data-types/index';
import VUploadButton from '../VUploadButton/VUploadButton.vue';

export default defineComponent({
  name: 'TheButtonProjectNew',
  components: { VUploadButton },
  data() {
    return {
      // Ctrl + P: create new project
      keyboardTrigger: (e: KeyboardEvent) => (e.key === 'p' && e.ctrlKey),
    };
  },
  computed: {
    ...mapGetters('workflow', [
      'dataType',
      'startNode',
    ]),
    ...mapState(['sourceService']),
    disabled(): boolean {
      const dataType = this.dataType as DataType | null;
      return dataType === null;
    },
    shown(): boolean {
      return this.sourceService.type === SourceType.FileUpload;
    },
    uploadType(): UploadTarget | null {
      const dataType = this.dataType as DataType | null;
      const dataTypeSetup = dataTypeSetups.find((d) => d.type === dataType);
      return dataTypeSetup?.importType ?? null;
    },
  },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'executeRegisterStorage',
      'executeDataObjectExtraction',
      'executeWorkflow',
    ]),
    async onNewProject(input: File | FileList): Promise<void> {
      if (input === null || input === undefined) return;
      await this.executeRegisterStorage();
      await this.executeDataObjectExtraction(input);
      this.setMessage({
        content: 'Project Data Uploaded.',
        type: MessageType.Success,
      });
      if (this.startNode === null) return;
      await this.executeWorkflow({ node: this.startNode });
    },
  },
});
</script>
