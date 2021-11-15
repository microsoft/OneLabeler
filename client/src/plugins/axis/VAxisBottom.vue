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
import { PropType } from 'vue';
import VAxis, { Orient } from './VAxis.vue';

export default {
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
  },
  data() {
    return { orient: Orient.Bottom };
  },
};
</script>
