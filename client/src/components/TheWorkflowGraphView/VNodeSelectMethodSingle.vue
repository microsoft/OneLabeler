<template>
  <div style="display: flex; flex: 1 1 100%;">
    <span
      class="subtitle-2"
      style="user-select: none; flex: 1 1 100%; align-self: center;"
    >
      Selected Method
    </span>
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          class="subtitle-2 text-none"
          style="border-color: #e0e0e0"
          small
          outlined
          v-on="on"
        >
          {{ selectedMethod.name }}
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(option, i) in menu.options"
          :key="i"
          @click="onClickMenuOption(option.value)"
        >
          <v-list-item-title class="subtitle-2">
            {{ option.text }}
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
          @click.stop="onCreateMenuOption"
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
import Vue, { PropType } from 'vue';
import { ProcessMethod } from '@/commons/types';

interface MethodMenu {
  title: string,
  options: [{
    value: ProcessMethod,
    text: string,
  }]
}

export default Vue.extend({
  name: 'VNodeSelectMethodSingle',
  props: {
    selectedMethod: {
      type: Object as PropType<ProcessMethod>,
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
    onClickMenuOption(option: ProcessMethod): void {
      this.$emit('update:selection', option);
    },
    onCreateMenuOption(): void {
      this.$emit('create:option');
    },
  },
});
</script>
