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
      @click="saveJsonFile(workflow, 'workflow.config.json')"
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
      @click="compileInstaller(workflow)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.hammer
      </v-icon>
    </v-btn>

    <!-- The export bundled code button. -->
    <v-btn
      title="Export bundled code"
      color="white"
      icon
      tile
      small
      @click="compileBundleZip(workflow)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.fileZip
      </v-icon>
    </v-btn>

    <!-- The export source code button. -->
    <v-btn
      title="Export source code"
      color="white"
      icon
      tile
      small
      @click="compileSourceZip(workflow)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.fileCode
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
      @click="$emit('toggle:inspect')"
    >
      <Icon
        icon="mdi:application-variable"
        style="font-size: 16px"
      />
    </v-btn>

    <TheNetworkMenu />

    <v-divider
      class="app-header-divider"
      vertical
    />

    <VDockSideButtons
      class="mr-1"
      @set:dock-side="setDockSide($event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';
import { Icon } from '@iconify/vue2';
import type { WorkflowGraph } from '@/commons/types';
import { saveJsonFile } from '@/plugins/file';
import {
  compileBundleZip,
  compileInstaller,
  compileSourceZip,
} from '@/services/compile-api';
import TheNetworkMenu from './TheNetworkMenu.vue';
import VTemplateMenu from './VTemplateMenu.vue';
import VDockSideButtons from './VDockSideButtons.vue';
import VUploadWorkflowButton from './VUploadWorkflowButton.vue';

export default defineComponent({
  name: 'TheDevPanelHeader',
  components: {
    Icon,
    TheNetworkMenu,
    VTemplateMenu,
    VDockSideButtons,
    VUploadWorkflowButton,
  },
  emits: {
    'toggle:inspect': null,
  },
  computed: {
    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  methods: {
    compileBundleZip,
    compileInstaller,
    compileSourceZip,
    saveJsonFile,
    ...mapActions(['setMessage', 'setDockSide']),
    ...mapActions('workflow', [
      'setGraph',
      'resetGraph',
    ]),
  },
});
</script>
