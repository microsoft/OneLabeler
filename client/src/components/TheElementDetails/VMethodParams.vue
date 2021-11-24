<template>
  <v-card
    :outlined="outlined"
    flat
  >
    <v-list
      dense
      class="py-0"
    >
      <!-- The parameters of the method. -->
      <v-list-item
        v-for="(param, paramKey) in params"
        :key="paramKey"
        class="py-0"
      >
        <v-list-item-title
          class="subtitle-2"
          style="user-select: none"
        >
          {{ param.label }}
        </v-list-item-title>
        <v-menu offset-y>
          <template #activator="{ on }">
            <v-btn
              class="subtitle-2 text-none"
              style="border-color: #e0e0e0"
              small
              outlined
              v-on="on"
            >
              {{ param.options.find((d) => d.value === param.value).label }}
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              v-for="(option, optionIdx) in param.options"
              :key="optionIdx"
              @click="$emit('click:param-option', { paramKey, option })"
            >
              <v-list-item-title class="subtitle-2">
                {{ option.label }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import type { MethodParams } from '@/commons/types';

export default {
  name: 'VMethodParams',
  props: {
    params: {
      type: Object as PropType<MethodParams>,
      required: true,
    },
    outlined: {
      type: Boolean as PropType<boolean>,
      default: true,
    },
  },
};
</script>
