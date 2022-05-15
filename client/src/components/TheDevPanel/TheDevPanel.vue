<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="background-color: white; display: flex; flex-direction: column;">
    <TheDevPanelHeader v-show="showToolbar"
      :show-element-settings.sync="showElementSettings"
      :show-inspector.sync="showInspector"
      @showGetStartedEvent="(arg) => this.showGetStartedHandler(arg)"
    />
    <TheDevPanelBody
      :show-element-settings="showElementSettings"
      :show-inspector="showInspector"
      class="pa-1"
      style="flex: 1 1 auto; overflow: hidden;"
      @showGetStartedEvent="(arg) => this.showGetStartedHandler(arg)"
      :showGetStarted = showStartPage
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import TheDevPanelBody from './TheDevPanelBody.vue';
import TheDevPanelHeader from './TheDevPanelHeader.vue';

export default defineComponent({
  name: 'TheDevPanel',
  components: {
    TheDevPanelBody,
    TheDevPanelHeader,
  },
  data() {
    return {
      showElementSettings: true,
      showInspector: true,
      showToolbar: false,
      showStartPage: true,
    };
  },
  methods: {
    showGetStartedHandler(show: boolean): void {
      this.showStartPage = show;
      this.showToolbar = !show;
    },
  },
});
</script>
