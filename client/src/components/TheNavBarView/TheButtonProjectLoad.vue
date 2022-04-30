<template>
  <VUploadButton
    :icon="$vuetify.icons.values.open"
    :keyboard-trigger="keyboardTrigger"
    title="Load Label Project (Ctrl + O)"
    type="File"
    color="white"
    small
    @upload:file="onLoadProject"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';
import { DefinedError } from 'ajv';
import { parseJsonFile } from '@/plugins/file';
import { MessageType } from '@/commons/types';
import type { IMessage } from '@/commons/types';
import VUploadButton from '../VUploadButton/VUploadButton.vue';
import { ProjectData, validate } from './load-project';

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
  name: 'TheButtonProjectLoad',
  components: { VUploadButton },
  data() {
    return {
      nDataObjects: 0,
      // Ctrl + O: load existing project
      keyboardTrigger: (e: KeyboardEvent) => (e.key === 'o' && e.ctrlKey),
    };
  },
  computed: {
    ...mapState(['dataObjects']),
  },
  watch: {
    async dataObjects() {
      const { dataObjects } = this;
      this.nDataObjects = dataObjects === null
        ? 0
        : await dataObjects.count();
    },
  },
  methods: {
    ...mapActions([
      'setMessage',
      'setProject',
    ]),
    async onLoadProject(file: File): Promise<void> {
      const data = await parseJsonFile(file);
      if (validate(data)) {
        this.setProject(data as ProjectData);
        this.setMessage({
          content: 'Project Progress Uploaded.',
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
