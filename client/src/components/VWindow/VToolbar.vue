<template>
  <v-card-title class="view-header">
    <slot name="title">
      Window
    </slot>
    <slot name="tools" />

    <v-spacer />
    <v-btn
      title="Minimize"
      x-small
      icon
      tile
      @click="onClickMinimize"
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
    <v-btn
      title="Pin"
      x-small
      icon
      tile
      @click="onClickPin"
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
  </v-card-title>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VToolbar',
  methods: {
    onClickMinimize() {
      this.$emit('window:minimize');
    },
    onClickPin() {
      this.$emit('window:pin');
    },
  },
});
</script>
