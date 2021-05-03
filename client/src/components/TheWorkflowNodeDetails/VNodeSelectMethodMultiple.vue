<template>
  <div style="display: flex; flex: 1 1 100%;">
    <v-row>
      <v-col
        class="py-0 pl-3"
        style="width: 18%; max-width: 18%; flex-basis: 18%; height: 40px"
      >
        <span>Selected Methods</span>
      </v-col>
      <v-col
        class="py-0 pl-0 pr-3"
        style="width: 82%; max-width: 82%; flex-basis: 82%"
      >
        <v-autocomplete
          :value="selectedMethods"
          :items="menu.options"
          outlined
          dense
          multiple
          full-width
          hide-details
          @input="onClickMenuOption($event)"
        >
          <template #selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              small
              label
              outlined
            >
              {{ data.item.label }}
            </v-chip>
          </template>
          <template #item="data">
            <v-list-item-title>
              <v-checkbox
                :label="data.item.label"
                :value="selectedMethods.findIndex((d) => d.id === data.item.value.id) >= 0"
                :input-value="selectedMethods.findIndex((d) => d.id === data.item.value.id) >= 0"
                class="py-0 ma-0 parameter-panel-checkbox"
                dense
                hide-details
              />
            </v-list-item-title>
            <p
              v-if="!data.item.value.isAlgorithmic"
              class="subtitle-2 text-right ma-1 grey--text"
            >
              interface
            </p>
            <p
              v-if="data.item.value.isServerless"
              class="subtitle-2 text-right ma-1 grey--text"
            >
              serverless
            </p>
            <p
              v-if="data.item.value.isBuiltIn"
              class="subtitle-2 text-right grey--text ma-1"
              style="white-space: nowrap"
            >
              built-in
            </p>
          </template>
          <template #append-item>
            <v-list-item
              v-if="appendCreateOption"
              class="px-6"
              @click="onCreateMenuOption"
            >
              <v-list-item-title class="subtitle-2">
                <v-icon
                  aria-hidden="true"
                  class="pr-2"
                  x-small
                >
                  $vuetify.icons.values.add
                </v-icon>
                Customize
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Process } from '@/commons/types';

interface MethodMenu {
  title: string,
  options: [{
    value: Process,
    label: string,
  }]
}

export default Vue.extend({
  name: 'VNodeSelectMethodMultiple',
  props: {
    selectedMethods: {
      type: Array as PropType<Process[]>,
      required: true,
    },
    menu: {
      type: Object as PropType<MethodMenu>,
      required: true,
    },
    appendCreateOption: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    onClickMenuOption(options: Process[]): void {
      // Sort by menu order.
      const orders = this.menu.options.map((d) => d.value.id);
      const sorted = options.sort((a, b) => (
        orders.indexOf(a.id) - orders.indexOf(b.id)
      ));
      this.$emit('update:selections', sorted);
    },
    onCreateMenuOption(): void {
      this.$emit('create:option');
    },
  },
});
</script>
