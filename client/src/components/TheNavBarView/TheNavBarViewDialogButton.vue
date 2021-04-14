<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="1400px"
    content-class="rounded-0"
  >
    <template #activator="{ on }">
      <v-btn
        class="app-header-button mr-1"
        title="Workflow"
        v-on="on"
      >
        <v-icon
          class="pr-1"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.config
        </v-icon>
        Workflow
      </v-btn>
    </template>
    <TheWorkflowPanel
      @click-close="onClickClose"
    />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import TheWorkflowPanel from '../TheWorkflowPanel/TheWorkflowPanel.vue';

export default Vue.extend({
  name: 'TheNavBarViewDialogButton',
  components: {
    TheWorkflowPanel,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    onClickClose(): void {
      this.dialog = false;
    },
  },
});
</script>
