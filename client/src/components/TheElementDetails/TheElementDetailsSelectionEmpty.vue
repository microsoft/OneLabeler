<template>
  <div
    :style="style.cardElevated"
    style="display: flex; flex-direction: column"
  >
    <div :style="style.cardHeader">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      Node/Edge Settings
    </div>
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; align-items: center">
      <p class="mx-auto subtitle-1">
        No Node or Edge Selected
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { cardElevated, cardHeader } from '@/style';

export default {
  name: 'TheElementDetailsSelectionEmpty',
  data() {
    return { style: { cardElevated, cardHeader } };
  },
};
</script>
