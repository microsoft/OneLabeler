<template>
  <v-card
    style="height: 100%; width: 100%;"
    tile
  >
    <v-card-title class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      Element Setting
    </v-card-title>
    <v-divider />
    <v-card-actions style="height: calc(100% - 30px)">
      <p class="mx-auto subtitle-1">
        No Workflow Element Selected
      </p>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TheNodeDetailsEmpty',
});
</script>
