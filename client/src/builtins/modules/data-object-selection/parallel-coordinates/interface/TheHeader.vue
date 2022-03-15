<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
  >
    <template #title>
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.data
      </v-icon>
      Dataset Overview
    </template>
  </VToolbar>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default defineComponent({
  name: 'TheHeader',
  components: { VToolbar },
  emits: {
    'window:minimize': null,
    'window:pin': null,
  },
});
</script>
