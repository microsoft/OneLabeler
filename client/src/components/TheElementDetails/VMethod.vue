<template>
  <div
    class="px-2"
    style="display: flex; flex-direction: column; gap: 8px;"
  >
    <!-- The label of the module instance. -->
    <VMethodLabel
      :label="method.label"
      :disabled="method.isBuiltIn"
      @edit:label="onUpsertMethod({ label: $event })"
    />

    <!-- The input box for module instance input parameters. -->
    <VMethodArgs
      :label="'Module Inputs'"
      :module-args="moduleInputs"
      :method-args="method.inputs"
      :disabled="method.isBuiltIn"
      @edit:method-args="onUpsertMethod({ inputs: $event })"
    />

    <!-- The display of module instance output parameters. -->
    <VMethodArgs
      :label="'Module Outputs'"
      :module-args="moduleOutputs"
      :method-args="method.outputs"
      :disabled="method.isBuiltIn || moduleOutputs.length === 1"
      @edit:method-args="onUpsertMethod({ outputs: $event })"
    />

    <!-- The url of the module instance service. -->
    <div
      style="display: flex; align-items: center;
      padding-left: 8px; padding-right: 8px; gap: 8px;
      border: thin solid rgba(0,0,0,.12); border-radius: 4px;"
    >
      <span class="subtitle-2">
        API
      </span>
      <v-text-field
        :value="method.isServerless ? 'serverless' : method.api"
        :disabled="method.isBuiltIn"
        class="ma-0 pt-1 subtitle-2"
        style="padding-bottom: 6px !important"
        type="text"
        dense
        hide-details
        single-line
        @input="onUpsertMethod({ api: $event })"
      />
    </div>

    <div
      v-if="requireModel"
      class="px-2"
      style="display: flex; flex-direction: column;
      border: thin solid rgba(0,0,0,.12); border-radius: 4px;"
    >
      <!-- The model used as input to the module. -->
      <VMethodModel
        :selected-model="model"
        :menu="menuOfModels"
        append-create-option
        class="py-1"
        @update:selection="onUpsertMethod({ model: $event })"
        @create:option="$emit('create:model')"
      />

      <template v-if="model !== undefined">
        <!-- The label of the model. -->
        <div style="display: flex; flex-direction: row; align-items: center;">
          Model Label
          <v-text-field
            :value="model.label"
            :disabled="model.isBuiltIn"
            class="ma-0 pl-4 pt-1 subtitle-2"
            style="padding-bottom: 6px !important"
            type="text"
            dense
            hide-details
            single-line
            @input="onEditModelLabel($event)"
          />
        </div>

        <!-- The url of the model. -->
        <div style="display: flex; flex-direction: row; align-items: center;">
          Model Key
          <v-text-field
            :value="model.isServerless ? 'serverless' : model.objectId"
            :disabled="model.isBuiltIn"
            class="ma-0 pl-4 pt-1 subtitle-2"
            style="padding-bottom: 6px !important"
            type="text"
            dense
            hide-details
            single-line
            @input="onEditModelAPI($event)"
          />
        </div>
      </template>
    </div>

    <!-- The parameters of the implementation. -->
    <VMethodParams
      v-if="method.params !== undefined"
      :params="method.params"
      @click:param-option="onEditMethodParam(
        $event.paramKey,
        $event.option,
      )"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ModelService, Process } from '@/commons/types';
import VMethodArgs from './VMethodArgs.vue';
import VMethodLabel from './VMethodLabel.vue';
import VMethodModel from './VMethodModel.vue';
import VMethodParams from './VMethodParams.vue';

export default defineComponent({
  name: 'VMethod',
  components: {
    VMethodArgs,
    VMethodLabel,
    VMethodModel,
    VMethodParams,
  },
  props: {
    method: {
      type: Object as PropType<Process>,
      required: true,
    },
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    moduleInputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    moduleOutputs: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  emits: {
    'edit:method': null,
    'create:model': null,
    'edit:model': null,
  },
  computed: {
    model(): ModelService | undefined {
      return this.method?.model;
    },
    requireModel(): boolean {
      return this.method.inputs.includes('model');
    },
    menuOfModels() {
      return {
        label: 'Models',
        options: this.models.map((d) => ({
          value: d,
          label: d.label,
        })),
      };
    },
  },
  methods: {
    onUpsertMethod(partial: Partial<Process>): void {
      const newValue: Process = { ...this.method, ...partial };
      this.$emit('edit:method', newValue);
    },
    onEditMethodParam(
      paramKey: string,
      option: { value: unknown, label: string },
    ): void {
      const { method } = this;
      const { params } = method;
      if (params === undefined) return;
      const partial = {
        params: {
          ...params,
          [paramKey]: {
            ...params[paramKey],
            value: option.value,
          },
        },
      };
      this.onUpsertMethod(partial);
    },
    onEditModelLabel(label: string): void {
      const { model } = this;
      if (model === undefined) return;
      const newModel: ModelService = { ...model, label };
      this.onUpsertMethod({ model: newModel });
      this.onEditModel(newModel);
    },
    onEditModelAPI(api: string): void {
      const { model } = this;
      if (model === undefined) return;
      const newModel = { ...model, api };
      this.onUpsertMethod({ model: newModel });
      this.onEditModel(newModel);
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit:model', newValue);
    },
  },
});
</script>
