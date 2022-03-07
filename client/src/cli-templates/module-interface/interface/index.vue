<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column;"
  >
    <TheHeader
      @window:minimize="$emit('update:task-window', { isMinimized: true })"
      @window:pin="$emit('update:task-window', { isPinned: true })"
    />
    <v-divider />
    <TheBody />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { cardElevated as styleCardElevated } from '@/style';
import TheHeader from './TheHeader.vue';
import TheBody from './TheBody.vue';

export default defineComponent({
  name: 'TheParallelCoordinates',
  components: {
    TheHeader,
    TheBody,
  },
  emits: {
    'update:task-window': null,
  },
  data() {
    return {
      styleCardElevated,
    };
  },
});
</script>
