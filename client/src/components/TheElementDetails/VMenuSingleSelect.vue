<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        class="subtitle-2 text-none"
        style="border-color: #e0e0e0"
        small
        outlined
        v-on="on"
      >
        {{ selectedOptionLabel }}
      </v-btn>
    </template>
    <v-list
      class="subtitle-2"
      dense
    >
      <v-list-item
        v-for="(item, i) in items"
        :key="i"
        @click="$emit('update:value', item.value)"
      >
        {{ item.label }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'VMenuSingleSelect',
  props: {
    value: {
      type: [String, Number, Boolean] as PropType<string | number | boolean | null>,
      default: null,
    },
    items: {
      type: Array as PropType<{ value: string | number | boolean, label: string }[]>,
      required: true,
    },
  },
  emits: {
    'update:value': null,
  },
  computed: {
    selectedOptionLabel(): string {
      const option = this.items.find((d) => d.value === this.value);
      return option === undefined ? 'please select' : option.label;
    },
  },
});
</script>
