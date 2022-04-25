<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    :style="styleCardElevated"
    style="display: flex; flex-direction: column;"
  >
    <!-- The graph canvas. -->
    <TheWorkflowViewBody
      :graph="{ nodes, edges }"
      :current-node="currentNode"
      style="flex: 1 1 auto"
    />
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { defineComponent } from '@vue/composition-api';
import { cardElevated as styleCardElevated } from '@/style';
import TheWorkflowViewBody from '@/components/TheWorkflowView/TheWorkflowViewBody.vue';

export default defineComponent({
  name: 'TheWorkflowMinimap',
  components: {
    TheWorkflowViewBody,
  },
  data() {
    return { styleCardElevated };
  },
  computed: {
    ...mapState('workflow', [
      'currentNode',
      'nodes',
      'edges',
    ]),
  },
});
</script>
