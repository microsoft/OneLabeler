<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <VAxis
    :orient="orient"
    v-bind="$props"
  >
    <template
      v-for="(_, slot) of $scopedSlots"
      #[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope"
      />
    </template>
  </VAxis>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VAxis, { Orient } from './VAxis.vue';

export default defineComponent({
  name: 'VAxisBottom',
  components: { VAxis },
  props: {
    /** The axis scale. */
    scale: {
      type: Function,
      required: true,
    },
    /** The tick arguments. */
    tickArguments: {
      type: Array as PropType<unknown[]>,
      default: () => [],
    },
    /** The inner tick size. */
    tickSizeInner: {
      type: Number as PropType<number>,
      default: 6,
    },
    /** The outer tick size. */
    tickSizeOuter: {
      type: Number as PropType<number>,
      default: 6,
    },
    /** The tick format function. */
    tickFormat: {
      type: Function as PropType<(d: string, i: number) => string | null>,
      default: null,
    },
    /** Whether to plot the outer tick showing extent of scale's domain. */
    showTickOuter: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  data() {
    return { orient: Orient.Bottom };
  },
});
</script>
