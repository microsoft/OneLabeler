<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <g>
    <g
      v-for="(icon, i) in getPropertyIcons(node)"
      :key="i"
      :transform="`translate(0,${-iconSize * i})`"
    >
      <rect
        :width="iconSize"
        :height="iconSize"
        fill="white"
        stroke="#bbb"
        stroke-width="1"
      />
      <component
        :is="icon"
        color="#bbb"
        :width="iconSize"
        :height="iconSize"
      />
    </g>
  </g>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import type { WorkflowNode } from '@/commons/types';
import {
  isNodeInteractive,
  isNodeServerless,
} from '@/commons/utils';
import IconServer from '@/plugins/icons/IconServer.vue';
import IconUser from '@/plugins/icons/IconUser.vue';

type TrimmedNode = Pick<WorkflowNode, 'type' | 'value'> | null;

const getPropertyIcons = (node: TrimmedNode): VueConstructor[] => {
  if (node === null) return [];
  return [
    ...(isNodeInteractive(node) ? [IconUser] : []),
    ...(!isNodeServerless(node) ? [IconServer] : []),
  ];
};

export default defineComponent({
  name: 'VNodePropertyIcons',
  props: {
    node: {
      type: Object as PropType<TrimmedNode>,
      default: null,
    },
    iconSize: {
      type: Number as PropType<number>,
      default: 20,
    },
  },
  methods: { getPropertyIcons },
});
</script>
