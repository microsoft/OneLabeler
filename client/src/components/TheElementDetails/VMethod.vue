<template>
  <v-container class="pa-0 pt-2 pb-0">
    <v-divider />

    <!-- The label of the module instance. -->
    <div class="pt-2 px-4">
      <VMethodLabel
        :label="method.label"
        :disabled="method.isBuiltIn"
        style="width: 100%"
        @edit:label="onUpsertMethod({ label: $event })"
      />
    </div>

    <!-- The input and output of the module instance. -->
    <div
      class="pt-2 px-4"
      style="display: flex"
    >
      <div style="width: 70%">
        <!-- The input box for module instance input parameters. -->
        <VMethodArgs
          :label="'Method Inputs'"
          :module-args="moduleInputs"
          :method-args="method.inputs"
          :disabled="method.isBuiltIn"
          @edit:method-args="onUpsertMethod({ inputs: $event })"
        />
      </div>
      <div
        class="pl-3"
        style="width: 30%"
      >
        <!-- The display of module instance output parameters. -->
        <VMethodArgs
          :label="'Method Outputs'"
          :module-args="moduleOutputs"
          :method-args="method.outputs"
          :disabled="method.isBuiltIn || moduleOutputs.length === 1"
          @edit:method-args="onUpsertMethod({ outputs: $event })"
        />
      </div>
    </div>

    <!-- The url of the module instance service. -->
    <v-card
      class="mx-4 mt-2"
      style="display: flex; flex: 1 1 100%;"
      outlined
    >
      <span class="pl-4 py-2 subtitle-2">
        API
      </span>
      <v-text-field
        :value="method.isServerless ? 'serverless' : method.api"
        :disabled="method.isBuiltIn"
        class="ma-0 px-4 pt-1 subtitle-2"
        style="padding-bottom: 6px !important"
        type="text"
        dense
        hide-details
        single-line
        @input="onUpsertMethod({ api: $event })"
      />
    </v-card>

    <template v-if="requireModel">
      <v-card
        class="mx-4 mt-2"
        outlined
      >
        <!-- The model used as input to the module. -->
        <div class="px-4 py-2">
          <VMethodModel
            :selected-model="model"
            :menu="menuOfModels"
            append-create-option
            @update:selection="onUpsertMethod({ model: $event })"
            @create:option="$emit('create:model')"
          />
        </div>

        <template v-if="model !== undefined">
          <!-- The label of the model. -->
          <v-list-item>
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
          </v-list-item>

          <!-- The url of the model. -->
          <v-list-item>
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
          </v-list-item>
        </template>
      </v-card>
    </template>

    <v-list-item
      v-if="method.params !== undefined"
      class="pt-2"
    >
      <VMethodParams
        :params="method.params"
        style="width: 100%"
        @click:param-option="onEditMethodParam(
          $event.paramKey,
          $event.option,
        )"
      />
    </v-list-item>
  </v-container>
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
