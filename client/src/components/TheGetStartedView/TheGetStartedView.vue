<template>
  <div
    :style="style.cardElevated"
    style="display: flex; flex-direction: column; overflow-wrap: break-word; min-width: 0;"
  >
    <div :style="style.cardHeader">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Get Started

      <v-spacer />
      <v-btn
        title="Close"
        x-small
        icon
        tile
        @click="$emit('window:close')"
      >
        <v-icon
          aria-hidden="true"
          small
          color="black"
          class="px-0"
        >
          $vuetify.icons.values.close
        </v-icon>
      </v-btn>
    </div>
    <v-divider />
    <div style="flex: 1 1 auto; margin-left: 64px;">
      <div style="font-size: 3.75rem; font-weight: 300; margin-top: 64px;">
        Start
      </div>
      <div>
        <TheButtonWorkflowNew @set:workflow="$emit('window:close')" />
      </div>
      <div>
        <TheButtonWorkflowUpload @set:workflow="$emit('window:close')" />
      </div>
      <div style="font-size: 3.75rem; font-weight: 300; margin-top: 64px;">
        Resources
      </div>
      <div>
        <TheButtonDocumentation />
      </div>
      <div>
        <TheButtonSourceCode />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { cardElevated, cardHeader } from '@/style';
import TheButtonDocumentation from './TheButtonDocumentation.vue';
import TheButtonSourceCode from './TheButtonSourceCode.vue';
import TheButtonWorkflowNew from './TheButtonWorkflowNew.vue';
import TheButtonWorkflowUpload from './TheButtonWorkflowUpload.vue';

export default defineComponent({
  name: 'TheGetStartedView',
  components: {
    TheButtonWorkflowNew,
    TheButtonWorkflowUpload,
    TheButtonDocumentation,
    TheButtonSourceCode,
  },
  data() {
    return { style: { cardElevated, cardHeader } };
  },
});
</script>
