<template>
  <v-card-title class="view-header">
    <v-icon
      class="px-2"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.data
    </v-icon>
    Dataset Overview
    <v-spacer />
  </v-card-title>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'TheProjectionViewHeader',
});
</script>
