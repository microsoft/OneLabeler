<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <!-- The context menu for nodes. -->
  <v-menu
    :value="show"
    :position-x="positionX"
    :position-y="positionY"
    content-class="elevation-2"
    offset-y
    @input="$emit('update:show', $event)"
  >
    <v-list
      class="py-0"
      style="font-size:12px"
    >
      <v-list-item
        class="py-0 pl-0 pr-1"
        style="min-height:24px"
        @click="$emit('switch-direction')"
      >
        <v-icon
          class="px-2"
          aria-hidden="true"
          style="font-size:12px; width: 1.5rem;"
          small
        >
          $vuetify.icons.values.changeDirection
        </v-icon>
        Switch Direction
      </v-list-item>
      <v-list-item
        class="py-0 pl-0 pr-1"
        style="min-height:24px"
        @click="$emit('remove:selected')"
      >
        <v-icon
          class="px-2"
          aria-hidden="true"
          style="font-size:12px; width: 1.5rem;"
          small
        >
          $vuetify.icons.values.reset
        </v-icon>
        Remove
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'TheMenuOfEdge',
  props: {
    show: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    positionX: {
      type: Number as PropType<number>,
      required: true,
    },
    positionY: {
      type: Number as PropType<number>,
      required: true,
    },
  },
  emits: {
    'update:show': null,
    'remove:selected': null,
    'switch-direction': null,
  },
});
</script>
