<template>
  <v-card
    style="display: flex; flex: 1 1 100%; align-items: center;"
    outlined
  >
    <!-- The parameters of the method. -->
    <v-list-item
      v-for="(param, paramName) in params"
      :key="paramName"
      class="py-0"
    >
      <v-list-item-title
        class="subtitle-2"
        style="user-select: none"
      >
        {{ param.title }}
      </v-list-item-title>
      <v-menu offset-y>
        <template #activator="{ on }">
          <v-btn
            class="subtitle-2 text-none"
            style="border-radius: 2px"
            small
            v-on="on"
          >
            {{ param.options.find((d) => d.value === param.value).text }}
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="(option, optionIdx) in param.options"
            :key="optionIdx"
            @click="onClickParamOption(paramName, option)"
          >
            <v-list-item-title class="subtitle-2">
              {{ option.text }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-list-item>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { MethodParams } from '@/commons/types';

export default Vue.extend({
  name: 'VNodeMethodParams',
  props: {
    params: {
      type: Object as PropType<MethodParams>,
    },
  },
  methods: {
    onClickParamOption(
      paramName: string,
      option: { value: unknown, text: string },
    ): void {
      this.$emit('click:param-option', { paramName, option });
    },
  },
});
</script>
