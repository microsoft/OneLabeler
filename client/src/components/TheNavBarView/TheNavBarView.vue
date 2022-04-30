<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    class="app-header pl-1"
    style="display: flex; align-items: center;"
    :style="{ height: `${height}px` }"
  >
    <!-- The new project button. -->
    <TheButtonProjectNew />

    <!-- The load project button. -->
    <TheButtonProjectLoad />

    <!-- The save label project button. -->
    <TheButtonProjectSave />

    <!-- The reset dataset button. -->
    <TheButtonProjectReset />

    <v-divider
      class="app-header-divider"
      vertical
    />

    <!-- The undo label editing button. -->
    <!-- <TheButtonUndo /> -->

    <!-- The export labeling result button. -->
    <TheButtonLabelExport />

    <v-divider
      class="app-header-divider"
      vertical
    />

    <!-- The start data labeling button. -->
    <TheButtonExecute />

    <v-divider
      class="app-header-divider"
      vertical
    />
    <v-spacer />

    <!-- The data management dialog button -->
    <TheDialogButtonDataManagement />

    <!-- The dashboard dialog button. -->
    <TheDialogButtonDashboard />

    <!-- The workflow dialog button. -->
    <v-btn
      v-if="isDeveloperMode"
      class="app-header-button mr-1 text-none subtitle-1"
      title="Workflow"
      @click="onClickWorkflowButton"
    >
      <v-icon
        class="pr-1"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.config
      </v-icon>
      Development
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';
import { DockSideType } from '@/commons/types';
import TheButtonExecute from './TheButtonExecute.vue';
import TheButtonLabelExport from './TheButtonLabelExport.vue';
import TheButtonProjectLoad from './TheButtonProjectLoad.vue';
import TheButtonProjectNew from './TheButtonProjectNew.vue';
import TheButtonProjectReset from './TheButtonProjectReset.vue';
import TheButtonProjectSave from './TheButtonProjectSave.vue';
import TheDialogButtonDashboard from './TheDialogButtonDashboard.vue';
import TheDialogButtonDataManagement from './TheDialogButtonDataManagement.vue';

const isDeveloperMode = process.env.VUE_APP_USER_TYPE === 'DEVELOPER';

export default defineComponent({
  name: 'TheNavBarView',
  components: {
    TheButtonExecute,
    TheButtonLabelExport,
    TheButtonProjectLoad,
    TheButtonProjectNew,
    TheButtonProjectReset,
    TheButtonProjectSave,
    TheDialogButtonDashboard,
    TheDialogButtonDataManagement,
  },
  props: {
    height: {
      type: Number as PropType<number>,
      default: 35,
    },
  },
  data() {
    return { isDeveloperMode };
  },
  computed: {
    ...mapState(['dockSide']),
  },
  methods: {
    ...mapActions(['setDockSide']),
    onClickWorkflowButton(): void {
      const { dockSide } = this;
      const updatedDockSide = (dockSide === DockSideType.Hide || dockSide === DockSideType.Minimap)
        ? DockSideType.Window
        : DockSideType.Hide;
      this.setDockSide(updatedDockSide);
    },
  },
});
</script>
