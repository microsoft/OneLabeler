<template>
  <v-menu
    v-if="strokeLabel !== null"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        width="85"
        class="card-header-button subtitle-2 pl-1 text-none"
        title="Set Stroke Color"
        x-small
        v-on="on"
      >
        {{ strokeLabel }}
        <v-spacer />
        <v-icon
          aria-hidden="true"
          small
          :style="{ color: label2color(strokeLabel) }"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="category in categories"
        :key="category"
        class="subtitle-2"
        style="min-height: 30px"
        @click="$emit('set:stroke-label', category)"
      >
        {{ category }}
        <div style="flex-grow: 1" />
        <v-icon
          class="pl-1"
          style="float: right"
          aria-hidden="true"
          small
          :style="{ color: label2color(category) }"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
  <v-btn
    v-else
    class="card-header-button subtitle-2"
    width="85"
    title="Set Stroke Color"
    x-small
    disabled
    icon
  >
    Color
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { Category } from '@/commons/types';

export default defineComponent({
  name: 'VStrokeColorMenu',
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    strokeLabel: {
      type: String as PropType<Category | null>,
      default: null,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'set:stroke-label': null,
  },
});
</script>
