<template>
  <v-app>
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
  </v-app>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { mapState } from 'vuex';
import {
  TaskWindow,
  WorkflowNodeType,
} from '@/commons/types';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';
import TheLabelView from '@/components/TheLabelView/TheLabelView.vue';
import TheProjectionView from '@/components/TheProjectionView/TheProjectionView.vue';
import TheFooterView from '@/components/TheFooterView/TheFooterView.vue';
import TheMessageView from '@/components/TheMessageView/TheMessageView.vue';

export default Vue.extend({
  name: 'App',
  components: {
    TheNavBarView,
    TheFooterView,
    TheMessageView,
  },
  computed: {
    ...mapState(['taskWindows']),
    ...mapState('workflow', ['nodes']),
    nWindows(): number {
      return this.taskWindowsDisplayed.length;
    },
    taskWindowsDisplayed(): TaskWindow[] {
      return this.taskWindows.filter((d) => !d.isMinimized);
    },
  },
  methods: {
    getComponent(taskWindow: TaskWindow): VueConstructor | null {
      const { node, process } = taskWindow;
      if (node.type === WorkflowNodeType.DataObjectSelection) {
        if (process.api === 'Projection') {
          return TheProjectionView;
        }
        return null;
      }
      if (node.type === WorkflowNodeType.InteractiveLabeling) {
        return TheLabelView;
      }
      return null;
    },
  },
});
</script>
