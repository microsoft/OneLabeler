<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        class="view-header-button subtitle-2"
        title="Set Stroke Width"
        x-small
        v-on="on"
      >
        <div style="display: flex; flex-direction: row; align-items: center">
          Size
          <svg
            :height="`${strokeWidth + 1}px`"
            width="30px"
            class="pl-1"
          >
            <rect
              :height="strokeWidth"
              :fill="!disabled ? 'black' : 'rgba(0,0,0,.26)'"
              width="30"
            />
          </svg>
        </div>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(width, i) in widths"
        :key="i"
        style="min-height: 30px"
        @click="$emit('set:stroke-width', width)"
      >
        <svg
          width="60px"
          height="18px"
        >
          <rect
            :y="9 - width/2"
            :height="width"
            width="60"
            fill="black"
          />
        </svg>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'VStrokeWidthMenu',
  props: {
    strokeWidth: {
      type: Number as PropType<number>,
      required: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'set:stroke-width': null,
  },
  data() {
    return {
      widths: [1, 5, 15],
    };
  },
});
</script>
