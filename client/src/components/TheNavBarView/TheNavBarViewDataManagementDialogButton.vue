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
    <TheDataManagementPanel @click:close="onClickClose" />
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import TheDataManagementPanel from '../TheDataManagementPanel/TheDataManagementPanel.vue';

export default Vue.extend({
  name: 'TheNavBarViewDashboardDialogButton',
  components: {
    TheDataManagementPanel,
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
