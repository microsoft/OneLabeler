<template>
  <div style="display: flex; flex: 1 1 100%; align-items: center;">
    <v-autocomplete
      :value="processOutput"
      :items="[processOutput]"
      :class="classNameOfProcessOutputWidget"
      label="Process Output"
      disabled
      outlined
      dense
      hide-details
    >
      <template #selection>
        <v-chip
          color="#FF7F0E"
          text-color="black"
          small
          outlined
        >
          {{ processOutput }}
        </v-chip>
      </template>
    </v-autocomplete>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VMethodOutput',
  props: {
    processOutput: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      classNameOfProcessOutputWidget: 'parameter-panel-process-output',
    };
  },
});
</script>

<style>
/** Hide the menu trigger button for process-output. */
.parameter-panel-process-output .v-input__append-inner {
  display: none;
}
</style>
