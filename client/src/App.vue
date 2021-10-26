<template>
  <v-app>
    <div
      :style="{
        flex: '1 1 auto',
        display: 'flex',
        'flex-direction': dockSide === DockSideType.BOTTOM ? 'column' : 'row',
      }"
    >
      <template v-if="dockSide === DockSideType.WINDOW">
        <v-dialog
          :value="true"
          persistent
          width="fit-content"
          content-class="rounded-0"
        >
          <TheDevPanel
            style="height: 600px; width: 1700px;"
            @click:close="onClickClosePanel"
          />
        </v-dialog>
      </template>
      <template v-if="dockSide === DockSideType.LEFT">
        <TheDevPanel
          style="flex: 1 1 50%"
          @click:close="onClickClosePanel"
        />
        <v-divider
          style="border-width: 2px;"
          vertical
        />
      </template>
      <div style="flex: 1 1 50%; display: flex; flex-direction: column;">
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
      <template v-if="dockSide === DockSideType.BOTTOM">
        <v-divider
          style="border-width: 2px;"
          horizontal
        />
        <TheDevPanel
          style="flex: 1 1 50%"
          @click:close="onClickClosePanel"
        />
      </template>
      <template v-if="dockSide === DockSideType.RIGHT">
        <v-divider
          style="border-width: 2px;"
          vertical
        />
        <TheDevPanel
          style="flex: 1 1 50%"
          @click:close="onClickClosePanel"
        />
      </template>
    </div>
  </v-app>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { mapActions, mapState } from 'vuex';
import {
  TaskWindow,
  WorkflowNodeType,
  DockSideType,
} from '@/commons/types';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';
import TheLabelView from '@/components/TheLabelView/TheLabelView.vue';
import TheSelectionView from '@/components/TheSelectionView/TheSelectionView.vue';
import TheFooterView from '@/components/TheFooterView/TheFooterView.vue';
import TheMessageView from '@/components/TheMessageView/TheMessageView.vue';
import TheDevPanel from '@/components/TheDevPanel/TheDevPanel.vue';

export default Vue.extend({
  name: 'App',
  components: {
    TheNavBarView,
    TheFooterView,
    TheMessageView,
    TheDevPanel,
  },
  data() {
    return { DockSideType };
  },
  computed: {
    ...mapState(['taskWindows', 'dockSide']),
    ...mapState('workflow', ['nodes']),
    nWindows(): number {
      return this.taskWindowsDisplayed.length;
    },
    taskWindowsDisplayed(): TaskWindow[] {
      const taskWindows = this.taskWindows as TaskWindow[];
      return taskWindows.filter((d) => !d.isMinimized);
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
    onClickClosePanel(): void {
      this.setDockSide(DockSideType.HIDE);
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
