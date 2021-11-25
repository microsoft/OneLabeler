<template>
  <div style="display: flex; flex: 1 1 100%;">
    <span
      class="subtitle-2"
      style="user-select: none; flex: 1 1 100%; align-self: center;"
    >
      {{ menu.label }}
    </span>
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          class="subtitle-2 text-none"
          style="border-color: #e0e0e0"
          small
          outlined
          :disabled="disabled"
          v-on="on"
        >
          {{ selectedMethod !== null ? selectedMethod.label : '' }}
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(option, i) in menu.options"
          :key="i"
          @click="$emit('update:selection', option.value)"
        >
          <v-list-item-title class="subtitle-2">
            {{ option.label }}
          </v-list-item-title>
          <p
            v-if="option.value.isServerless"
            class="subtitle-2 text-right ma-1 grey--text"
            style="width: 5em"
          >
            serverless
          </p>
          <p
            v-if="option.value.isBuiltIn"
            class="subtitle-2 text-right ma-1 grey--text"
            style="width: 7em"
          >
            built-in
          </p>
        </v-list-item>
        <v-list-item
          v-if="appendCreateOption"
          @click.stop="$emit('create:option')"
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
      </v-list>
    </v-menu>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';

interface IMethod {
  label: string;
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
  name: 'VNodeSelectMethod',
  props: {
    selectedMethod: {
      type: Object as PropType<IMethod | null>,
      default: null,
    },
    menu: {
      type: Object as PropType<MethodMenu>,
      required: true,
    },
    appendCreateOption: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
};
</script>
