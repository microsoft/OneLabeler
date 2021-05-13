<template>
  <div
    dense
    class="app-footer"
    :style="{
      flex: '1 1 auto',
      display: 'inherit',
      height: `${height}px`,
    }"
  >
    <div style="height: 100%">
      <button
        v-for="(taskWindow, i) in taskWindows"
        :key="i"
        class="mx-1 subtitle-2 grey--text text--lighten-2 window-bar"
        :style="{
          'background': isNodeCurrent(taskWindow.node)
            ? 'rgba(255,255,255,0.2)' : undefined,
        }"
      >
        <div class="mx-2">
          {{ `${taskWindow.node.label} - ${taskWindow.process.label}` }}
        </div>
      </button>
    </div>
    <v-spacer />
    <TheFooterViewStats />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import { WorkflowNode } from '@/commons/types';
import TheFooterViewStats from './TheFooterViewStats.vue';

export default Vue.extend({
  name: 'TheFooterView',
  components: {
    TheFooterViewStats,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  computed: {
    ...mapState('workflow', ['nodes', 'currentNode']),
    ...mapGetters('workflow', ['taskWindows']),
  },
  methods: {
    isNodeCurrent(node: WorkflowNode): boolean {
      if (this.currentNode === null) return false;
      return node.id === this.currentNode.id;
    },
  },
});
</script>

<style scoped>
.window-bar {
  display: inline-flex;
  align-items: center;
  height: 100%;
  user-select: none;
  box-shadow: 0px -2px 0px 0px #76b9ed inset;
}
.window-bar:hover {
  background: rgba(255,255,255,0.05);
}
</style>
