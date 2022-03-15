<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        class="card-header-button subtitle-2"
        title="Set Stroke Shape"
        x-small
        v-on="on"
      >
        Brush
        <v-icon
          class="pl-1"
          style="width: 20px"
          aria-hidden="true"
          small
        >
          {{ strokeShapeMenu.optionsIcon[strokeShapeIndex] }}
        </v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(option, i) in strokeShapeMenu.options"
        :key="i"
        class="subtitle-2"
        style="min-height: 30px"
        @click="$emit('set:stroke-shape', option)"
      >
        {{ strokeShapeMenu.optionsText[i] }}
        <div style="flex-grow: 1" />
        <v-icon
          class="pl-2"
          aria-hidden="true"
          small
        >
          {{ strokeShapeMenu.optionsIcon[i] }}
        </v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export enum StrokeShapeType {
  Circle = 'Circle',
  Square = 'Square',
}

export default defineComponent({
  name: 'VStrokeShapeMenu',
  props: {
    strokeShape: {
      type: String as PropType<StrokeShapeType>,
      required: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'set:stroke-shape': null,
  },
  data() {
    return {
      strokeShapeMenu: {
        options: [StrokeShapeType.Circle, StrokeShapeType.Square],
        optionsText: ['Circle', 'Square'],
        optionsIcon: [this.$vuetify.icons.values.circle, this.$vuetify.icons.values.square],
      },
    };
  },
  computed: {
    strokeShapeIndex(): number {
      const { strokeShape, strokeShapeMenu } = this;
      const index = strokeShapeMenu.options.findIndex((d) => d === strokeShape);
      return index;
    },
  },
});
</script>
