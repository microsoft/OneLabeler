<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <!-- The method used to instantiated the process. -->
  <div style="display: flex; align-items: center;">
    <div style="flex: 1 1 40%;">
      <VNodeSelectMethod
        :title="label"
        :selected-method="service"
        :menu="menuOfServices"
        :disabled="disabled"
        append-create-option
        @update:selection="$emit('select:service', $event)"
        @create:option="$emit('create:service', $event)"
      />
    </div>
    <div
      class="pl-4"
      style="display: flex; flex: 1 1 60%; align-items: center;"
    >
      <span class="subtitle-2">
        API
      </span>
      <v-text-field
        :value="service.isServerless ? 'serverless' : service.api"
        :disabled="service.isBuiltIn || disabled"
        class="my-0 pl-4 subtitle-2"
        style="padding-bottom: 6px !important"
        type="text"
        dense
        hide-details
        single-line
        @input="onInputServiceAPI"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VNodeSelectMethod from '@/components/TheElementDetails/VNodeSelectMethod.vue';

interface IService {
  api: string;
  label: string;
  isBuiltIn: boolean;
  isServerless: boolean;
}

export default defineComponent({
  name: 'VEditableService',
  components: { VNodeSelectMethod },
  props: {
    label: {
      type: String as PropType<string>,
      required: true,
    },
    service: {
      type: Object as PropType<IService>,
      required: true,
    },
    options: {
      type: Array as PropType<IService[]>,
      required: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'create:service': null,
    'select:service': null,
    'edit:service': null,
  },
  computed: {
    menuOfServices(): {
      label: string,
      options: { value: IService, label: string }[],
      } {
      return {
        label: this.label,
        options: (this.options as IService[]).map((d) => ({
          value: d,
          label: d.label,
        })),
      };
    },
  },
  methods: {
    onInputServiceAPI(api: string): void {
      const service = this.service as IService;
      const newValue: IService = { ...service, api };
      this.$emit('edit:service', newValue);
    },
  },
});
</script>
