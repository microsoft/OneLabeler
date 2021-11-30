<template>
  <v-card class="rounded-0">
    <div
      class="app-header"
      style="display: flex; align-items: center; height: 35px;"
    >
      <div class="app-header-logo px-2">
        Data Management
      </div>

      <div style="flex-grow: 1" />

      <v-btn
        class="mr-1"
        title="Close"
        color="white"
        icon
        tile
        small
        @click="$emit('click:close')"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.close
        </v-icon>
      </v-btn>
    </div>
    <div
      class="pa-1 subtitle-2"
      style="display: flex; flex-direction: row;"
    >
      <TheDataManagementView style="flex: 1 1 auto" />
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import TheDataManagementView from './TheDataManagementView.vue';

export default defineComponent({
  name: 'TheDashboardPanel',
  components: { TheDataManagementView },
  emits: {
    'click:close': null,
  },
});
</script>
