<template>
  <VUploadWorkflowButton
    color="white"
    small
    @set:workflow="setGraph($event)"
    @set:message="setMessage($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions } from 'vuex';
import VUploadWorkflowButton from './VUploadWorkflowButton.vue';

export default defineComponent({
  name: 'TheButtonWorkflowUpload',
  components: { VUploadWorkflowButton },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', ['setGraph']),
  },
});
</script>
