<template>
  <div
    :class="{ 'selected-span': isSelected !== null && isSelected(span) }"
    class="card pa-1"
    @click="$emit('select:span', span)"
  >
    <div style="display: flex">
      <!-- The category legend. -->
      <div class="category-legend">
        <v-icon
          aria-hidden="true"
          small
          :style="{ color }"
        >
          $vuetify.icons.values.square
        </v-icon>
        {{ span.category }}
      </div>
      <v-spacer />

      <!-- The remove button. -->
      <v-btn
        title="remove"
        class="card-header-button elevation-0"
        style="border-color: #bbb"
        x-small
        icon
        outlined
        @click.stop="$emit('remove:span', span)"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.reset
        </v-icon>
      </v-btn>

      <!-- The link button. -->
      <v-btn
        v-if="enableLink"
        :class="{ 'linking-span-button': isLinking !== null && isLinking(span) }"
        title="link"
        class="card-header-button elevation-0"
        style="border-color: #bbb"
        x-small
        icon
        outlined
        @click.stop="$emit('link:span', span)"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.link
        </v-icon>
      </v-btn>
    </div>
    <div class="mx-1">
      {{ span.text }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ILabelTextSpan } from '@/commons/types';

export default defineComponent({
  name: 'VLabelSpan',
  props: {
    span: {
      type: Object as PropType<ILabelTextSpan>,
      required: true,
    },
    color: {
      type: String as PropType<string>,
      default: '#bbb',
    },
    enableLink: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    isSelected: {
      type: Function as PropType<((span: ILabelTextSpan) => boolean) | null>,
      default: null,
    },
    isLinking: {
      type: Function as PropType<((span: ILabelTextSpan) => boolean) | null>,
      default: null,
    },
  },
  emits: {
    'select:span': null,
    'remove:span': null,
    'link:span': null,
  },
});
</script>

<style lang="scss" scoped>
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
.selected-span {
  border-color: gray !important;
}
.linking-span-button {
  background-color: #bbb;
}
.category-legend {
  $padding: 4px;
  padding-left: $padding;
  padding-right: $padding;
  gap: $padding;
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  height: 20px;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 2px;
}
</style>
