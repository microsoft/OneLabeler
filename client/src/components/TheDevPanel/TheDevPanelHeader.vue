<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    class="app-header"
    style="display: flex; align-items: center; height: 35px;"
  >
    <div
      class="app-header-logo px-2"
      style="display: flex; align-items: center;"
    >
      <BaseIcon
        style="display: contents"
        small
      >
        <IconOneLabeler
          class="mr-2"
          style="width: inherit; height: inherit;"
        />
      </BaseIcon>
      OneLabeler
    </div>

    <v-divider
      class="app-header-divider"
      vertical
    />

    <!-- The workflow upload button. -->
    <TheButtonWorkflowUpload />

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
      @click="tryCompile(CompileType.Installer)"
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
      @click="tryCompile(CompileType.Bundle)"
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
      @click="tryCompile(CompileType.Source)"
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

    <!-- <VTemplateMenu @set:workflow="setGraph($event)" /> -->

    <v-divider
      class="app-header-divider mr-1"
      vertical
    />

    <v-btn-toggle
      :value="showElementSettings"
      class="card-header-button-toggle elevation-0"
    >
      <v-btn
        :value="true"
        title="Show node & edge details"
        color="white"
        icon
        tile
        small
        @click="$emit('update:showElementSettings', !showElementSettings)"
      >
        <v-icon
          aria-hidden="true"
          color="white"
          small
        >
          $vuetify.icons.values.config
        </v-icon>
      </v-btn>
    </v-btn-toggle>

    <v-btn-toggle
      :value="showInspector"
      class="card-header-button-toggle elevation-0"
    >
      <v-btn
        :value="true"
        title="Show variable inspector"
        color="white"
        icon
        tile
        small
        @click="$emit('update:showInspector', !showInspector)"
      >
        <Icon
          icon="mdi:application-variable"
          style="font-size: 16px"
        />
      </v-btn>
    </v-btn-toggle>

    <TheNetworkMenu />

    <v-divider
      class="app-header-divider mx-1"
      vertical
    />

    <!-- The run preview button. -->
    <v-btn
      class="subtitle-1 text-none px-1"
      title="Run and Debug"
      color="white"
      plain
      tile
      @click="onClickPreviewButton"
    >
      <v-icon
        class="pr-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.play
      </v-icon>
      Preview
    </v-btn>

    <v-spacer />

    <!-- The close window button. -->
    <v-btn
      title="Close"
      x-small
      icon
      tile
      @click="onClickClose"
    >
      <v-icon
        aria-hidden="true"
        small
        color="white"
        class="px-0"
      >
        $vuetify.icons.values.close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';
import { Icon } from '@iconify/vue2';
import { DockSideType, MessageType } from '@/commons/types';
import type { WorkflowGraph } from '@/commons/types';
import { saveJsonFile } from '@/plugins/file';
import compile, { CompileType } from '@/services/compile-api';
import IconOneLabeler from '@/plugins/icons/IconOneLabeler.vue';
import BaseIcon from '@/components/BaseIcon/BaseIcon.vue';
import TheButtonWorkflowUpload from './TheButtonWorkflowUpload.vue';
import TheNetworkMenu from './TheNetworkMenu.vue';
// import VTemplateMenu from './VTemplateMenu.vue';

export default defineComponent({
  name: 'TheDevPanelHeader',
  components: {
    BaseIcon,
    Icon,
    IconOneLabeler,
    TheButtonWorkflowUpload,
    TheNetworkMenu,
    // VTemplateMenu,
  },
  props: {
    showElementSettings: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
    showInspector: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  emits: [{ 'toggle:inspect': null }, 'showGetStartedEvent'],

  data() {
    return { CompileType };
  },
  computed: {
    ...mapState(['dockSide']),
    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  methods: {
    saveJsonFile,
    ...mapActions(['setMessage', 'setDockSide']),
    ...mapActions('workflow', [
      'setGraph',
      'resetGraph',
    ]),
    async tryCompile(type: CompileType): Promise<void> {
      try {
        await compile(this.workflow, type);
      } catch (e) {
        this.setMessage({
          content: (e as Error).message,
          type: MessageType.Error,
        });
      }
    },
    onClickPreviewButton(): void {
      const { dockSide } = this;
      const updatedDockSide = (dockSide === DockSideType.Hide || dockSide === DockSideType.Minimap)
        ? DockSideType.Window
        : DockSideType.Hide;
      this.setDockSide(updatedDockSide);
    },
    onClickClose(): void {
      if (window.confirm('Save and close the project?')) {
        this.$emit('showGetStartedEvent', true);
      }
    },
  },
});
</script>
