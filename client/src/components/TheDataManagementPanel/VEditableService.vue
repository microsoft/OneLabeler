<template>
  <!-- The method used to instantiated the process. -->
  <div style="display: flex; align-items: center;">
    <div style="flex: 1 1 40%;">
      <VNodeSelectMethodSingle
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
import Vue, { PropType } from 'vue';
import VNodeSelectMethodSingle from '../TheElementDetails/VNodeSelectMethodSingle.vue';

interface IService {
  api: string;
  label: string;
  isBuiltIn: boolean;
  isServerless: boolean;
}

export default Vue.extend({
  name: 'VEditableService',
  components: { VNodeSelectMethodSingle },
  props: {
    label: {
      type: String,
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
      type: Boolean,
      default: false,
    },
  },
  computed: {
    menuOfServices() {
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
