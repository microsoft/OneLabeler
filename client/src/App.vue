<template>
  <v-app>
    <div style="flex: 1 1 auto; display: flex; flex-direction: row;">
      <div style="flex: 1 1 auto; display: flex; flex-direction: column;">
        <TheNavBarView />
        <div style="display: flex; flex: 1 1 auto;">
          <div
            v-for="(taskWindow, i) in taskWindowsDisplayed"
            :key="`col-${taskWindow.node.id}-${taskWindow.process.id}`"
            :style="{ width: `${100 / nWindows}%` }"
            class="pa-1"
            :class="{ 'pl-0': (taskWindows.length !== 1 && i !== 0) }"
          >
            <component
              :is="getComponent(taskWindow)"
              :task-window="taskWindow"
              style="height: 100%;"
            />
          </div>
        </div>
        <TheFooterView />
        <TheMessageView />
      </div>
      <!--
      <v-divider
        style="border-width: 2px;"
        vertical
      />
      <TheWorkflowPanel style="flex: 1 1 50%" />
      -->
    </div>
  </v-app>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { mapActions, mapState } from 'vuex';
import {
  TaskWindow,
  WorkflowNodeType,
} from '@/commons/types';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';
import TheLabelView from '@/components/TheLabelView/TheLabelView.vue';
import TheSelectionView from '@/components/TheSelectionView/TheSelectionView.vue';
import TheFooterView from '@/components/TheFooterView/TheFooterView.vue';
import TheMessageView from '@/components/TheMessageView/TheMessageView.vue';
import TheWorkflowPanel from '@/components/TheWorkflowPanel/TheWorkflowPanel.vue';

export default Vue.extend({
  name: 'App',
  components: {
    TheNavBarView,
    TheFooterView,
    TheMessageView,
    TheWorkflowPanel,
  },
  computed: {
    ...mapState(['taskWindows']),
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
    ...mapActions(['updatedTaskWindowsByNodes']),
    getComponent(taskWindow: TaskWindow): VueConstructor | null {
      const { node } = taskWindow;
      if (node.type === WorkflowNodeType.DataObjectSelection) return TheSelectionView;
      if (node.type === WorkflowNodeType.InteractiveLabeling) return TheLabelView;
      return null;
    },
  },
});
</script>
