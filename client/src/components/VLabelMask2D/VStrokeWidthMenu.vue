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
            class="pl-1"
            width="30px"
            :height="`${strokeWidth + 1}px`"
          >
            <rect
              :height="strokeWidth"
              width="30"
              :fill="!disabled ? 'black' : 'rgba(0,0,0,.26)'"
            />
          </svg>
        </div>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(entry, i) in strokeWidthMenu.options"
        :key="i"
        style="min-height: 30px"
        @click="onSetStrokeWidth(entry)"
      >
        <svg
          width="60px"
          height="18px"
        >
          <rect
            :y="9 - strokeWidthMenu.options[i]/2"
            :height="strokeWidthMenu.options[i]"
            width="60"
            fill="black"
          />
        </svg>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
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
  data() {
    return {
      strokeWidthMenu: {
        options: [1, 5, 15],
        optionsText: ['1', '5', '15'],
      },
    };
  },
  methods: {
    onSetStrokeWidth(strokeWidth: number): void {
      this.$emit('set:stroke-width', strokeWidth);
    },
  },
});
</script>
