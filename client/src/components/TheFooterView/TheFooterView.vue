<template>
  <div
    class="app-footer"
    :style="{
      display: 'flex',
      height: `${height}px`,
    }"
  >
    <button
      v-for="(taskWindow, i) in taskWindows"
      :key="i"
      class="mx-1 window-bar"
      :class="{ 'active': !taskWindow.isMinimized }"
      :style="{
        'background': isNodeCurrent(taskWindow.node)
          ? 'rgba(255,255,255,0.2)' : undefined,
      }"
      @click="onClickBar(taskWindow)"
    >
      <div class="mx-2 footer-text">
        {{ `${taskWindow.node.label}` }}
      </div>
    </button>

    <div style="flex-grow: 1" />

    <TheFooterViewStats />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { TaskWindow, WorkflowNode } from '@/commons/types';
import TheFooterViewStats from './TheFooterViewStats.vue';

export default Vue.extend({
  name: 'TheFooterView',
  components: { TheFooterViewStats },
  props: {
    height: {
      default: 30,
      type: Number,
    },
  },
  computed: {
    ...mapState(['taskWindows']),
    ...mapState('workflow', ['nodes', 'currentNode']),
  },
  methods: {
    ...mapActions(['editTaskWindow']),
    isNodeCurrent(node: WorkflowNode): boolean {
      if (this.currentNode === null) return false;
      return node.id === this.currentNode.id;
    },
    onClickBar(taskWindow: TaskWindow): void {
      const { isMinimized } = taskWindow;
      this.editTaskWindow({
        ...taskWindow,
        isMinimized: !isMinimized,
      });
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';

.footer-text {
  @extend .subtitle-2;
  @extend .grey--text;
  @extend .text--lighten-2;
}
.window-bar {
  display: inline-flex;
  align-items: center;
  height: 100%;
  user-select: none;
}
.window-bar:hover {
  background: rgba(255,255,255,0.05);
}
.active {
  box-shadow: 0px -2px 0px 0px #76b9ed inset;
}
</style>
