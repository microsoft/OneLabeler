<template>
  <div
    class="app-header"
    style="display: flex; align-items: center; height: 35px;"
  >
    <div class="app-header-logo px-2">
      OneLabeler
    </div>

    <v-divider
      class="app-header-divider"
      vertical
    />

    <!-- The workflow upload button. -->
    <VUploadWorkflowButton
      @set:workflow="setGraph($event)"
      @set:message="setMessage($event)"
    />

    <!-- The workflow export button. -->
    <v-btn
      title="Export Workflow"
      color="white"
      icon
      tile
      small
      @click="onClickExport"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.save
      </v-icon>
    </v-btn>

    <!-- The export compilation result button. -->
    <v-btn
      title="Compile Labeling Tool Installer (takes a few minutes!)"
      color="white"
      icon
      tile
      small
      @click="onClickCompile"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.hammer
      </v-icon>
    </v-btn>

    <!-- The export source code button. -->
    <v-btn
      title="Export source code"
      color="white"
      icon
      tile
      small
      @click="onClickSourceCode"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.fileZip
      </v-icon>
    </v-btn>

    <!-- The configuration reset button. -->
    <v-btn
      title="Reset Settings"
      color="white"
      icon
      tile
      small
      @click="resetGraph()"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.reset
      </v-icon>
    </v-btn>

    <v-divider
      class="app-header-divider"
      vertical
    />

    <VTemplateMenu
      :workflow="workflow"
      @set:workflow="setGraph($event)"
    />

    <v-divider
      class="app-header-divider"
      vertical
    />

    <v-spacer />

    <v-btn
      title="Show variable inspector"
      color="white"
      icon
      tile
      small
      @click="showVariableInspector = true"
    >
      <Icon
        icon="mdi:application-variable"
        style="font-size: 16px"
      />
    </v-btn>

    <v-divider
      class="app-header-divider"
      vertical
    />

    <VDockSideButtons @set:dock-side="setDockSide($event)" />

    <v-btn
      class="mr-1"
      title="Close"
      color="white"
      icon
      tile
      small
      @click="$emit('click:close')"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { Icon } from '@iconify/vue2';
import {
  WorkflowGraph,
  DockSideType,
} from '@/commons/types';
import { saveJsonFile } from '@/plugins/file';
import templates from '@/builtins/workflow-templates/index';
import { compileInstaller, compileZip } from '@/services/compile-api';
import TheDevPanelBody from '../TheDevPanelBody/TheDevPanelBody.vue';
import VTemplateMenu from './VTemplateMenu.vue';
import VDockSideButtons from './VDockSideButtons.vue';
import VUploadWorkflowButton from './VUploadWorkflowButton.vue';

export default Vue.extend({
  name: 'TheDevPanelHeader',
  components: {
    Icon,
    VTemplateMenu,
    TheDevPanelBody,
    VDockSideButtons,
    VUploadWorkflowButton,
  },
  data() {
    return {
      DockSideType,
      templates,
      showVariableInspector: true,
    };
  },
  computed: {
    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  methods: {
    ...mapActions(['setMessage', 'setDockSide']),
    ...mapActions('workflow', [
      'setGraph',
      'resetGraph',
    ]),
    onClickExport(): void {
      saveJsonFile(this.workflow, 'workflow.config.json');
    },
    async onClickCompile(): Promise<void> {
      await compileInstaller(this.workflow);
    },
    async onClickSourceCode(): Promise<void> {
      await compileZip(this.workflow);
    },
  },
});
</script>
