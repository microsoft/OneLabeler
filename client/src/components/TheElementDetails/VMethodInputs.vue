<template>
  <div style="display: flex; flex: 1 1 100%; align-items: center;">
    <v-autocomplete
      :value="methodInputs"
      :items="moduleInputs"
      :disabled="disabled"
      label="Process Input"
      outlined
      dense
      multiple
      hide-details
      @input="onEditMethodInputs($event)"
    >
      <template #selection="data">
        <v-chip
          v-bind="data.attrs"
          :input-value="data.selected"
          color="#FF7F0E"
          text-color="black"
          small
          outlined
        >
          {{ data.item }}
        </v-chip>
      </template>
      <template #item="data">
        <v-list-item-content
          dense
          :class="classNameOfCheckbox"
        >
          <v-checkbox
            :label="data.item"
            :value="methodInputs.findIndex((d) => d === data.item) >= 0"
            :input-value="methodInputs.findIndex((d) => d === data.item) >= 0"
            :disabled="moduleRequiredInputs.findIndex((d) => d === data.item) >= 0"
            class="ma-0"
            dense
            hide-details
          />
        </v-list-item-content>
      </template>
    </v-autocomplete>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

export default Vue.extend({
  name: 'VMethodInputs',
  props: {
    moduleInputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    moduleRequiredInputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    methodInputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      classNameOfCheckbox: 'parameter-panel-checkbox',
    };
  },
  methods: {
    onEditMethodInputs(newValues: string[]): void {
      // Sort by input list order.
      const orders = this.moduleInputs;
      const sorted = newValues.sort((a, b) => (
        orders.indexOf(a) - orders.indexOf(b)
      ));
      this.$emit('edit:method-inputs', sorted);
    },
  },
});
</script>

<style>
/** Change the font of checkbox text. */
.parameter-panel-checkbox .v-label {
  font-size: 0.875rem !important;
}
</style>
