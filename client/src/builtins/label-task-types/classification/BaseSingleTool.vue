<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <!-- The data object label category menu. -->
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :color="buttonColor === null ? '' : buttonColor"
        :disabled="disabled"
        class="card-header-button subtitle-2 text-none"
        x-small
        v-on="on"
      >
        {{ label === null ? '' : label.category }}
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(category, i) in categories"
        :key="i"
        class="subtitle-2"
        style="min-height: 30px"
        @click="$emit('upsert:labels', { category })"
      >
        {{ category }}
        <div style="flex-grow: 1" />
        <v-icon
          aria-hidden="true"
          small
          :style="{ color: label2color(category) }"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Category, ILabel } from '@/commons/types';

export default defineComponent({
  name: 'BaseSingleTool',
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<((label: string) => string) | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'upsert:labels': null,
  },
  computed: {
    buttonColor(): string | null {
      const { label, label2color } = this;
      if (label === undefined
        || label === null
        || label.category === undefined
        || label2color === null) return null;
      return label2color(label.category);
    },
  },
});
</script>
