<template>
  <div style="display: flex; flex: 1 1 100%;">
    <span
      class="subtitle-2"
      style="user-select: none; align-self: center;"
    >
      Selected Model
    </span>
    <v-spacer />
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          class="subtitle-2 text-none"
          style="border-color: #e0e0e0"
          small
          outlined
          v-on="on"
        >
          {{ selectedModel === null ? '' : selectedModel.label }}
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
            style="width: 6em"
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
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ModelService } from '@/commons/types';

interface ModelMenu {
  label: string,
  options: [{
    value: ModelService,
    label: string,
  }]
}

export default defineComponent({
  name: 'VMethodModel',
  props: {
    selectedModel: {
      type: Object as PropType<ModelService>,
      default: null,
    },
    menu: {
      type: Object as PropType<ModelMenu>,
      required: true,
    },
    appendCreateOption: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
  emits: {
    'update:selection': null,
    'create:option': null,
  },
});
</script>
