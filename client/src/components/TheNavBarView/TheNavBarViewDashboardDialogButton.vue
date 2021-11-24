<template>
  <v-dialog
    v-model="dialog"
    persistent
    width="fit-content"
    content-class="rounded-0"
  >
    <template #activator="{ on }">
      <v-btn
        class="app-header-button mr-1 text-none subtitle-1"
        title="Dashboard"
        v-on="on"
      >
        <v-icon
          class="pr-1"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.dashboard
        </v-icon>
        Dashboard
      </v-btn>
    </template>
    <TheDashboardPanel @click:close="dialog = false" />
  </v-dialog>
</template>

<script lang="ts">
import TheDashboardPanel from '../TheDashboardPanel/TheDashboardPanel.vue';

export default {
  name: 'TheNavBarViewDashboardDialogButton',
  components: { TheDashboardPanel },
  data() {
    return { dialog: false };
  },
};
</script>
