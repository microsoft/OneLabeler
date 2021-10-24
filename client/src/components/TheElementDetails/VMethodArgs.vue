<template>
  <div style="display: flex; flex: 1 1 100%; align-items: center;">
    <v-autocomplete
      :value="methodArgs"
      :items="moduleArgs"
      :disabled="disabled"
      :label="label"
      outlined
      dense
      multiple
      hide-details
      @input="onEditMethodArgs($event)"
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
            :value="methodArgs.findIndex((d) => d === data.item) >= 0"
            :input-value="methodArgs.findIndex((d) => d === data.item) >= 0"
            :disabled="moduleRequiredArgs.findIndex((d) => d === data.item) >= 0"
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
  name: 'VMethodArgs',
  props: {
    label: {
      type: String as PropType<string>,
      default: '',
    },
    moduleArgs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    moduleRequiredArgs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    methodArgs: {
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
    onEditMethodArgs(newValues: string[]): void {
      // Sort by input list order.
      const orders = this.moduleArgs;
      const sorted = newValues.sort((a, b) => (
        orders.indexOf(a) - orders.indexOf(b)
      ));
      this.$emit('edit:method-args', sorted);
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
