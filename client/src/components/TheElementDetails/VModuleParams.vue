<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div
    class="px-2 py-1"
    :style="outlined ? styleCard : ''"
    style="display: flex; flex-direction: column; gap: 4px;"
  >
    <!-- The parameters of the method. -->
    <div
      v-for="(param, paramKey) in params"
      :key="paramKey"
      style="display: flex; flex-direction: row; align-items: center;"
    >
      <div
        class="subtitle-2 pr-1"
        style="user-select: none; white-space: nowrap"
      >
        {{ param.label }}
      </div>
      <v-spacer />
      <component
        :is="getComponent(param.multiple)"
        :value="param.value"
        :items="filterOptions(param, params)"
        @update:value="$emit(
          'click:param-option',
          { paramKey, value: $event },
        )"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ParamSpecification, ModuleParams } from '@/commons/types';
import { card as styleCard } from '@/style';
import VMenuSingleSelect from './VMenuSingleSelect.vue';
import VMenuMultiSelect from './VMenuMultiSelect.vue';

const getComponent = (multiple: boolean) => (
  multiple ? VMenuMultiSelect : VMenuSingleSelect
);
const filterOptions = (
  param: ParamSpecification<unknown, boolean>,
  params: ModuleParams,
) => {
  if (param.validate === undefined) return param.options;
  const { validate } = param;
  return param.options.filter((d) => validate(d.value, params));
};

export default defineComponent({
  name: 'VModuleParams',
  props: {
    params: {
      type: Object as PropType<ModuleParams>,
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
  data() {
    return { styleCard };
  },
  methods: {
    getComponent,
    filterOptions,
  },
});
</script>
