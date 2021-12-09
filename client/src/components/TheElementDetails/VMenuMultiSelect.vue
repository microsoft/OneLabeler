<template>
  <v-autocomplete
    :value="value"
    :items="items"
    outlined
    dense
    multiple
    full-width
    hide-details
    @input="$emit('update:value', $event)"
  >
    <template #selection="data">
      <v-chip
        v-bind="data.attrs"
        :input-value="data.selected"
        style="text-transform: capitalized"
        small
        label
        outlined
      >
        {{ data.item.label }}
      </v-chip>
    </template>
    <template #item="data">
      <v-checkbox
        :label="data.item.label"
        :value="value.findIndex((d) => d === data.item.value) >= 0"
        :input-value="value.findIndex((d) => d === data.item.value) >= 0"
        class="py-0 ma-0 parameter-panel-checkbox"
        dense
        hide-details
      />
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'VMenuMultiSelect',
  props: {
    value: {
      type: Array as PropType<(string | number | boolean)[]>,
      required: true,
    },
    items: {
      type: Array as PropType<{ value: string | number | boolean, label: string }[]>,
      required: true,
    },
  },
  emits: {
    'update:value': null,
  },
});
</script>
