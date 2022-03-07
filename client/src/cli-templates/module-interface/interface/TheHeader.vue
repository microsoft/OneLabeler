<template>
  <VToolbar
    @window:minimize="$emit('window:minimize')"
    @window:pin="$emit('window:pin')"
  >
    <template #title>
      The Name Of Your Interface Module
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
