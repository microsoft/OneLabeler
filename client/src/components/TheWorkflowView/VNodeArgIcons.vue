<template>
  <g>
    <g
      v-for="(arg, i) in args"
      :key="i"
      :transform="`translate(${iconSize * i},0)`"
      color="white"
      class="hover-black"
      style="pointer-events: bounding-box"
    >
      <!-- The square region where the tooltip can be triggered. -->
      <rect
        :width="iconSize"
        :height="iconSize"
        opacity="0"
      />
      <title>
        {{ arg }}
      </title>
      <g transform="translate(2,2)">
        <component
          :is="arg in stateToIcon ? stateToIcon[arg] : null"
          color="currentColor"
          width="16"
          height="16"
        />
      </g>
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import type { StateNames } from '@/commons/types';
import IconDataObjects from '@/plugins/icons/IconDataObjects.vue';
import IconFeatureRepresentations from '@/plugins/icons/IconFeatureRepresentations.vue';
import IconLabels from '@/plugins/icons/IconLabels.vue';
import IconLabelSpace from '@/plugins/icons/IconLabelSpace.vue';
import IconModel from '@/plugins/icons/IconModel.vue';
import IconSamples from '@/plugins/icons/IconSamples.vue';
import IconStop from '@/plugins/icons/IconStop.vue';

const stateToIcon: Record<StateNames, VueConstructor> = {
  dataObjects: IconDataObjects,
  labels: IconLabels,
  features: IconFeatureRepresentations,
  model: IconModel,
  queryUuids: IconSamples,
  categories: IconLabelSpace,
  stop: IconStop,
};

export default defineComponent({
  name: 'VNodeArgIcons',
  props: {
    args: {
      type: Array as PropType<StateNames[]>,
      default: () => [],
    },
    iconSize: {
      type: Number as PropType<number>,
      default: 20,
    },
  },
  data() {
    return { stateToIcon };
  },
});
</script>

<style lang="scss" scoped>
.hover-black:hover {
  color: #000;
}
</style>
