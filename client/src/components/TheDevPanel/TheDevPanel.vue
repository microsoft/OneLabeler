<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="background-color: white; max-width: 100%; display: flex; flex-direction: column;">
    <TheDevPanelHeader
      :show-element-settings.sync="showElementSettings"
      :show-inspector.sync="showInspector"
    />
    <TheDevPanelBody
      :show-element-settings="showElementSettings"
      :show-inspector="showInspector"
      class="pa-1"
      style="flex: 1 1 auto; overflow: auto;"
    />
  </div>
</template>

<script lang="ts">
import TheDevPanelBody from './TheDevPanelBody.vue';
import TheDevPanelHeader from './TheDevPanelHeader.vue';

export default {
  name: 'TheDevPanel',
  components: {
    TheDevPanelBody,
    TheDevPanelHeader,
  },
  data() {
    return {
      showElementSettings: true,
      showInspector: true,
    };
  },
};
</script>
