<template>
  <div style="display: flex; flex: 1 1 100%;">
    <div style="width: 16%; height: 40px">
      <span>Selected Methods</span>
    </div>
    <div style="width: 84%">
      <v-autocomplete
        :value="selectedOptions"
        :items="menu.options"
        outlined
        dense
        multiple
        full-width
        hide-details
        @input="onClickMenuOption"
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
              :value="selectedOptions
                .findIndex((d) => d.value.id === data.item.value.id) >= 0"
              :input-value="selectedOptions
                .findIndex((d) => d.value.id === data.item.value.id) >= 0"
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
            @click="$emit('create:option')"
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
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';

interface IMethod {
  id: string;
  label: string;
  isAlgorithmic: boolean;
  isBuiltIn: boolean;
  isServerless: boolean;
}

interface MethodMenu {
  label: string;
  options: {
    value: IMethod;
    label: string;
  }[];
}

export default {
  name: 'VNodeSelectMethodMultiple',
  props: {
    selectedMethods: {
      type: Array as PropType<IMethod[]>,
      required: true,
    },
    menu: {
      type: Object as PropType<MethodMenu>,
      required: true,
    },
    appendCreateOption: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  computed: {
    selectedOptions() {
      const { menu } = this;
      return this.selectedMethods.map((d) => (
        menu.options.find((option) => option.value.id === d.id)
      ));
    },
  },
  methods: {
    onClickMenuOption(options: IMethod[]): void {
      // Sort by menu order.
      const orders = this.menu.options.map((d) => d.value.id);
      const sorted = options.sort((a, b) => (
        orders.indexOf(a.id) - orders.indexOf(b.id)
      ));
      this.$emit('update:selections', sorted);
    },
  },
};
</script>
