<template>
  <v-card
    class="rounded-0"
    style="display: flex; flex-direction: column;"
  >
    <TheDevPanelHeader />
    <TheDevPanelBody
      class="pa-2 subtitle-2"
      style="flex: 1 1 auto"
    />
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from '@iconify/vue2';
import VUploadButton from '../VUploadButton/VUploadButton.vue';
import TheDevPanelBody from '../TheDevPanelBody/TheDevPanelBody.vue';
import TheDevPanelHeader from './TheDevPanelHeader.vue';

export default Vue.extend({
  name: 'TheDevPanel',
  components: {
    Icon,
    VUploadButton,
    TheDevPanelBody,
    TheDevPanelHeader,
  },
  data() {
    return {
      showVariableInspector: true,
    };
  },
});
</script>
