`<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    class="app-header pl-1"
    style="display: flex; align-items: center;"
    :style="{ height: `${height}px` }"
  >
    <!-- The save label project button. -->
    <TheButtonProjectSave />

    <!-- The reset dataset button. -->
    <TheButtonProjectReset v-if="isPreview" />

    <v-divider
      class="app-header-divider"
      vertical
    />

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

    <VDockSideButtons
      v-if="isDeveloperMode"
      class="mr-1"
      @set:dock-side="setDockSide($event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapActions, mapState, mapGetters } from 'vuex';
import VDockSideButtons from '../VDockSideButtons/VDockSideButtons.vue';
import TheButtonExecute from './TheButtonExecute.vue';
import TheButtonLabelExport from './TheButtonLabelExport.vue';
import TheButtonProjectReset from './TheButtonProjectReset.vue';
import TheButtonProjectSave from './TheButtonProjectSave.vue';
import TheDialogButtonDashboard from './TheDialogButtonDashboard.vue';
import TheDialogButtonDataManagement from './TheDialogButtonDataManagement.vue';
import { WorkMode } from './load-project';

const isDeveloperMode = process.env.VUE_APP_USER_TYPE === 'DEVELOPER';

export default defineComponent({
  name: 'TheNavBarView',
  components: {
    VDockSideButtons,
    TheButtonExecute,
    TheButtonLabelExport,
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
    ...mapGetters('workflow', ['startNode']),
    isPreview(): boolean {
      return !!window.projectContext && window.projectContext === WorkMode.Preview;
    },
  },
  async mounted() {
    await this.onNewProject();
  },
  methods: {
    ...mapActions(['setDockSide']),
    ...mapActions('workflow', ['executeWorkflow']),

    async onNewProject(): Promise<void> {
      await this.executeWorkflow({ node: this.startNode });
    },
  },
});
</script>
