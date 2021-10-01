<template>
  <v-card
    class="rounded-0"
    style="display: flex; flex-direction: column;"
  >
    <TheDevPanelHeader
      @toggle:inspect="showInspector = !showInspector"
    />
    <TheDevPanelBody
      :show-inspector="showInspector"
      class="pa-2 subtitle-2"
      style="flex: 1 1 auto"
    />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import TheDevPanelBody from '../TheDevPanelBody/TheDevPanelBody.vue';
import TheDevPanelHeader from './TheDevPanelHeader.vue';

export default Vue.extend({
  name: 'TheDevPanel',
  components: {
    TheDevPanelBody,
    TheDevPanelHeader,
  },
  data() {
    return {
      showInspector: false,
    };
  },
});
</script>
