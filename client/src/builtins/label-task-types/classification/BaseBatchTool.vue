<template>
  <!-- The data object label category menu. -->
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        class="view-header-button subtitle-2 text-none"
        x-small
        v-on="on"
      >
        Set Batch Labels
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(category, i) in [...categories, unlabeledMark]"
        :key="i"
        class="subtitle-2"
        style="min-height: 30px"
        @click="$emit('upsert-bulk:labels', { category })"
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
import type { Category } from '@/commons/types';

export default defineComponent({
  name: 'VBatchTool',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'upsert-bulk:labels': null,
  },
});
</script>
