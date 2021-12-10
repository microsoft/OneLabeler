<template>
  <div
    class="px-2"
    style="display: flex; flex-direction: column; gap: 8px;"
  >
    <!-- The label of the module instance. -->
    <VModuleLabel
      v-if="!isInit && !isDecision && !isExit"
      :label="method.label"
      :disabled="method.isBuiltIn"
      @edit:label="onUpsertModule({ label: $event })"
    />

    <!-- The module instance input parameters. -->
    <VModuleArgs
      v-if="!isInit && !isExit"
      :label="'Module Inputs'"
      :module-args="moduleInputs"
      :method-args="method.inputs"
      :disabled="method.isBuiltIn"
      @update:module-args="onUpsertModule({ inputs: $event })"
    />

    <!-- The module instance output parameters. -->
    <VModuleArgs
      v-if="!isDecision && !isExit"
      :label="'Module Outputs'"
      :module-args="moduleOutputs"
      :method-args="method.outputs"
      :disabled="!isInit && (method.isBuiltIn || moduleOutputs.length === 1)"
      @update:module-args="onUpsertModule({ outputs: $event })"
    />

    <!-- The url of the module instance service. -->
    <div
      v-if="!method.isServerless"
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
        @input="onUpsertModule({ api: $event })"
      />
    </div>

    <div
      v-if="requireModel"
      class="px-2"
      style="display: flex; flex-direction: column;
      border: thin solid rgba(0,0,0,.12); border-radius: 4px;"
    >
      <!-- The model used as input to the module. -->
      <VModuleModel
        :selected-model="model"
        :menu="menuOfModels"
        append-create-option
        class="py-1"
        @update:selection="onUpsertModule({ model: $event })"
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
    <VModuleParams
      v-if="method.params !== undefined"
      :params="method.params"
      @click:param-option="onEditMethodParam(
        $event.paramKey,
        $event.value,
      )"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { cloneDeep } from 'lodash';
import { ModuleType } from '@/commons/types';
import type { ModelService, IModule } from '@/commons/types';
import VModuleArgs from './VModuleArgs.vue';
import VModuleLabel from './VModuleLabel.vue';
import VModuleModel from './VModuleModel.vue';
import VModuleParams from './VModuleParams.vue';

export default defineComponent({
  name: 'VModule',
  components: {
    VModuleArgs,
    VModuleLabel,
    VModuleModel,
    VModuleParams,
  },
  props: {
    method: {
      type: Object as PropType<IModule>,
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
    'update:module': null,
    'create:model': null,
    'edit:model': null,
  },
  computed: {
    isInit(): boolean {
      return this.method.type === ModuleType.Initialization;
    },
    isDecision(): boolean {
      return this.method.type === ModuleType.Decision;
    },
    isExit(): boolean {
      return this.method.type === ModuleType.Exit;
    },
    model(): ModelService | undefined {
      return this.method?.model;
    },
    requireModel(): boolean {
      return this.method.inputs.includes('model');
    },
    menuOfModels(): { label: string, options: { value: ModelService, label: string }[] } {
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
    onUpsertModule(partial: Partial<IModule>): void {
      const newValue: IModule = { ...this.method, ...partial };
      this.$emit('update:module', newValue);
    },
    onEditMethodParam(paramKey: string, value: unknown): void {
      const { method } = this;
      const { params } = method;
      if (params === undefined) return;
      const newValue = cloneDeep(method);
      if (newValue.params === undefined) return;
      newValue.params[paramKey].value = value;
      this.$emit('update:module', newValue);
    },
    onEditModelLabel(label: string): void {
      const { model } = this;
      if (model === undefined) return;
      const newModel: ModelService = { ...model, label };
      this.onUpsertModule({ model: newModel });
      this.$emit('edit:model', newModel);
    },
    onEditModelAPI(api: string): void {
      const { model } = this;
      if (model === undefined) return;
      const newModel = { ...model, api };
      this.onUpsertModule({ model: newModel });
      this.$emit('edit:model', newModel);
    },
  },
});
</script>
