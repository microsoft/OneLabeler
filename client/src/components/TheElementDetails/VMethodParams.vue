<template>
  <div
    class="card px-2 py-1"
    style="display: flex; flex-direction: column; gap: 4px;"
  >
    <!-- The parameters of the method. -->
    <div
      v-for="(param, paramKey) in params"
      :key="paramKey"
      style="display: flex; flex-direction: row; align-items: center;"
    >
      <div
        class="subtitle-2"
        style="user-select: none"
      >
        {{ param.label }}
      </div>
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { MethodParams } from '@/commons/types';

export default defineComponent({
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
  emits: {
    'click:param-option': null,
  },
});
</script>

<style lang="scss" scoped>
.card {
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
</style>
