<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <VUploadButton
    :icon="$vuetify.icons.values.open"
    title="Open Workflow File"
    type="File"
    v-bind="$attrs"
    @upload:file="onUploadFile"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import VUploadButton from '../VUploadButton/VUploadButton.vue';

export default defineComponent({
  name: 'VUploadWorkflowButton',
  components: { VUploadButton },
  emits: {
    'set:workflow': null,
    'set:message': null,
  },
  methods: {
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      this.$emit('set:project', file);
    },
  },
});
</script>
