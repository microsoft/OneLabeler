<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        class="subtitle-1 text-none px-1"
        color="white"
        plain
        tile
        v-on="on"
      >
        <v-icon
          class="pr-2"
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.diagram
        </v-icon>
        Templates
      </v-btn>
    </template>
    <VTemplateList @set:workflow="$emit('set:workflow', $event)" />
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import VTemplateList from './VTemplateList.vue';

export default defineComponent({
  name: 'VTemplateMenu',
  components: { VTemplateList },
  emits: { 'set:workflow': null },
});
</script>
