<template>
  <div :style="styleCardHeader">
    <slot name="title">
      Window
    </slot>
    <slot name="tools" />

    <div style="flex-grow: 1" />

    <v-btn
      title="Minimize"
      x-small
      icon
      tile
      @click="$emit('window:minimize')"
    >
      <v-icon
        aria-hidden="true"
        small
        color="black"
        class="px-0"
      >
        $vuetify.icons.values.minimize
      </v-icon>
    </v-btn>
    <!--
    <v-btn
      title="Pin"
      x-small
      icon
      tile
      @click="$emit('window:pin')"
    >
      <v-icon
        aria-hidden="true"
        small
        color="black"
        class="px-0"
      >
        $vuetify.icons.values.pin
      </v-icon>
    </v-btn>
    -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { cardHeader as styleCardHeader } from '@/style';

export default defineComponent({
  name: 'VToolbar',
  emits: {
    'window:minimize': null,
  },
  data() {
    return { styleCardHeader };
  },
});
</script>
