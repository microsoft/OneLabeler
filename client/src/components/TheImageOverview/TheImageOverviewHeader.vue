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
import Vue from 'vue';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default Vue.extend({
  name: 'TheImageOverviewHeader',
  components: { VToolbar },
});
</script>
