<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <v-app>
    <div
      style="flex: 1 1 auto; display: flex;"
      :style="{
        'flex-direction': {
          [DockSideType.Bottom]: 'column',
          [DockSideType.Left]: 'row-reverse',
          [DockSideType.Right]: 'row',
        }[dockSide],
      }"
    >
      <div
        style="flex: 1 1 50%; display: flex; flex-direction: column;"
        :style="dockSide === DockSideType.FullScreen ? 'display: none' : null"
      >
        <TheNavBarView />
        <div
          class="windows-container"
          :style="{ 'grid-template-columns': `repeat(${nWindows}, 1fr)` }"
        >
          <template v-for="taskWindow in taskWindowsDisplayed">
            <component
              :is="getComponent(taskWindow)"
              :key="`col-${taskWindow.node.id}-${taskWindow.process.id}`"
              :task-window="taskWindow"
            />
          </template>
        </div>
        <TheFooterView />
        <TheMessageView />
      </div>
      <template v-if="dockSide === DockSideType.Window">
        <v-dialog
          :value="true"
          persistent
          width="fit-content"
          content-class="rounded-0"
        >
          <TheDevPanel
            style="height: 600px; width: 1700px;"
            @click:close="setDockSide(DockSideType.Hide)"
          />
        </v-dialog>
      </template>
      <template v-else-if="dockSide !== DockSideType.Hide && dockSide !== DockSideType.Minimap">
        <v-divider
          v-if="dockSide !== DockSideType.FullScreen"
          style="border-width: 2px;"
          :horizontal="dockSide === DockSideType.Bottom"
          :vertical="dockSide === DockSideType.Right || dockSide === DockSideType.Left"
        />
        <TheDevPanel
          style="flex: 1 1 50%"
          @click:close="setDockSide(DockSideType.Hide)"
        />
      </template>
    </div>
    <template v-if="dockSide === DockSideType.Minimap">
      <TheWorkflowMinimap
        style="position: absolute; pointer-events: none;
        width: 800px; height: 400px;
        transform: scale(0.5); transform-origin: 0% 0% 0px;
        margin-top: 80px;
        margin-left: 10px;
        opacity: 0.9"
      />
    </template>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { VueConstructor } from 'vue';
import { mapActions, mapState } from 'vuex';
import {
  TaskWindow,
  WorkflowNode,
  WorkflowNodeType,
  DockSideType,
} from '@/commons/types';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';
import TheLabelView from '@/components/TheLabelView/TheLabelView.vue';
import TheSelectionView from '@/components/TheSelectionView/TheSelectionView.vue';
import TheFooterView from '@/components/TheFooterView/TheFooterView.vue';
import TheMessageView from '@/components/TheMessageView/TheMessageView.vue';
import TheDevPanel from '@/components/TheDevPanel/TheDevPanel.vue';
import TheWorkflowMinimap from '@/components/TheWorkflowMinimap/TheWorkflowMinimap.vue';

export default defineComponent({
  name: 'App',
  components: {
    TheNavBarView,
    TheFooterView,
    TheMessageView,
    TheDevPanel,
    TheWorkflowMinimap,
  },
  data() {
    return { DockSideType };
  },
  computed: {
    ...mapState(['taskWindows', 'dockSide']),
    ...mapState('workflow', ['nodes', 'currentNode']),
    nWindows(): number {
      return this.taskWindowsDisplayed.length;
    },
    taskWindowsDisplayed(): TaskWindow[] {
      const taskWindows = this.taskWindows as TaskWindow[];
      const currentNode = this.currentNode as WorkflowNode | null;
      return taskWindows
        .filter((d) => !d.isMinimized)
        .filter((d) => d.node.value?.persistent === true
          || (currentNode !== null && d.node.id === currentNode.id));
    },
  },
  mounted() {
    this.updatedTaskWindowsByNodes(this.nodes);
  },
  methods: {
    ...mapActions(['updatedTaskWindowsByNodes', 'setDockSide']),
    getComponent(taskWindow: TaskWindow): VueConstructor | null {
      const { node } = taskWindow;
      if (node.type === WorkflowNodeType.DataObjectSelection) return TheSelectionView;
      if (node.type === WorkflowNodeType.InteractiveLabeling) return TheLabelView;
      return null;
    },
  },
});
</script>

<style lang="scss" scoped>
.windows-container {
  $margin: 4px;
  display: grid;
  flex: 1 1 auto;
  gap: $margin;
  margin: $margin;
}
</style>
