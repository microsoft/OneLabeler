<template>
  <v-app id="app">
    <v-container
      class="pa-0"
      fill-height
      fluid
    >
      <v-row
        class="pa-0"
        no-gutters
      >
        <TheNavBarView :height="navBarHeight" />
      </v-row>
      <v-row
        :style="`height: calc(100% - ${navBarHeight + footerHeight}px);`"
        class="pa-1"
        no-gutters
      >
        <template v-for="(taskWindow, i) in taskWindowsDisplayed">
          <v-col
            :key="`col-${taskWindow.node.id}-${taskWindow.process.id}`"
            :cols="12/nWindows"
            :class="(taskWindows.length !== 1 && i !== 0) ? 'pl-1' : ''"
          >
            <component
              :is="getComponent(taskWindow)"
              :task-window="taskWindow"
              style="height: 100%;"
            />
          </v-col>
        </template>
      </v-row>
      <v-row
        class="pa-0"
        no-gutters
      >
        <TheFooterView :height="footerHeight" />
      </v-row>
    </v-container>
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
  data(): { navBarHeight: number, footerHeight: number } {
    return {
      navBarHeight: 35,
      footerHeight: 30,
    };
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
