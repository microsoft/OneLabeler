<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="600px"
    content-class="rounded-0"
  >
    <template #activator="{ on }">
      <v-btn
        class="app-header-button mr-1 text-none subtitle-1"
        title="Data Management"
        v-on="on"
      >
        <v-icon
          class="pr-1"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.dashboard
        </v-icon>
        Data Management
      </v-btn>
    </template>
    <TheDataManagementPanel @click:close="dialog = false" />
  </v-dialog>
</template>

<script lang="ts">
import TheDataManagementPanel from '../TheDataManagementPanel/TheDataManagementPanel.vue';

export default {
  name: 'TheNavBarViewDashboardDialogButton',
  components: { TheDataManagementPanel },
  data() {
    return { dialog: false };
  },
};
</script>
