<template>
  <v-card
    style="height: 100%; width: 100%; display: flex; flex-direction: column"
    tile
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      Module Setting
    </div>
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; align-items: center">
      <p class="mx-auto subtitle-1">
        No Module Selected
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TheElementDetailsSelectionEmpty',
});
</script>
