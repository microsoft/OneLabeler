<template>
  <v-card
    :outlined="outlined"
    flat
  >
    <v-list dense class="py-0">
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
          {{ param.title }}
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
              @click="onClickParamOption(paramKey, option)"
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
import Vue, { PropType } from 'vue';
import { MethodParams } from '@/commons/types';

export default Vue.extend({
  name: 'VNodeMethodParams',
  props: {
    params: {
      type: Object as PropType<MethodParams>,
    },
    outlined: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    onClickParamOption(
      paramKey: string,
      option: { value: unknown, label: string },
    ): void {
      this.$emit('click:param-option', { paramKey, option });
    },
  },
});
</script>
