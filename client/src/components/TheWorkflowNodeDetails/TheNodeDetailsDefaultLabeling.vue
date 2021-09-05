<template>
  <v-card
    :class="classNameOfPanel"
    style="width: 100%; height: 100%;"
    tile
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
    </div>

    <v-divider />

    <!-- The label of the process node. -->
    <div class="py-2 px-4">
      <VNodeEditableLabel
        :label="node.label"
        @edit:label="onEditNodeLabel"
      />
    </div>

    <!-- The method used to instantiated the process. -->
    <div class="py-2 px-4">
      <VNodeSelectMethodSingle
        :selected-method="method"
        :menu="menuOfMethods"
        append-create-option
        @update:selection="onUpdateMethodOption"
        @create:option="onCreateMethod"
      />
    </div>

    <v-divider class="mt-2" />

    <template v-if="method !== null">
      <!-- The label of the feature extraction method. -->
      <div class="py-2 px-4">
        <VNodeEditableMethodLabel
          :label="method.label"
          :disabled="method.isBuiltIn"
          style="width: 100%"
          @edit:label="onEditMethodLabel($event)"
        />
      </div>

      <div
        class="pt-2 px-4"
        style="display: flex"
      >
        <div style="width: 70%">
          <!-- The input box for process input parameters. -->
          <VNodeEditableInput
            :process-input-list="processInputList"
            :process-input-list-of-required="processInputListOfRequired"
            :instance-input-list="method.inputs"
            :disabled="method.isBuiltIn"
            @edit:list="onEditInstanceInputList($event)"
          />
        </div>
        <div
          class="pl-3"
          style="width: 30%"
        >
          <!-- The display of process output parameters. -->
          <VNodeOutput :process-output="processOutput" />
        </div>
      </div>

      <!-- The url of feature extraction service. -->
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
          @input="onInputMethodAPI($event)"
        />
      </v-card>

      <v-card
        v-if="isModelBased"
        class="mx-4 mt-2"
        outlined
      >
        <!-- The model used as input to the process. -->
        <div class="px-4 py-2">
          <VNodeSelectModel
            :selected-model="model"
            :menu="menuOfModels"
            append-create-option
            @update:selection="onClickMenuOfModelsOption($event)"
            @create:option="onCreateModel"
          />
        </div>

        <template v-if="model !== undefined">
          <!-- The label of the method. -->
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
              @input="onInputModelLabel($event)"
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
              @input="onInputModelAPI($event)"
            />
          </v-list-item>
        </template>
      </v-card>
    </template>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  ModelService,
  Process,
  WorkflowNode,
} from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodLabel from './VNodeEditableMethodLabel.vue';
import VNodeEditableLabel from './VNodeEditableLabel.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodSingle from './VNodeSelectMethodSingle.vue';
import VNodeSelectModel from './VNodeSelectModel.vue';

export default Vue.extend({
  name: 'TheNodeDetailsDefaultLabeling',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodLabel,
    VNodeEditableLabel,
    VNodeOutput,
    VNodeSelectMethodSingle,
    VNodeSelectModel,
  },
  props: {
    methods: {
      type: Array as PropType<Process[]>,
      default: () => [],
    },
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<WorkflowNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Default Labeling Instantiation',
      processInputList: ['features', 'model'],
      processInputListOfRequired: ['features'],
      processOutput: 'labels',
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    method(): Process | null {
      return this.node.value as Process | null;
    },
    model(): ModelService | undefined {
      return (this.node.value as Process).model;
    },
    isModelBased(): boolean {
      if (this.method === null) return false;
      return this.method.inputs
        .findIndex((d) => d === 'model') >= 0;
    },
    menuOfMethods() {
      return {
        label: 'Selected Method',
        options: this.methods.map((d) => ({
          value: d,
          label: d.label,
        })),
      };
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
    onEditNodeLabel(label: string): void {
      const { node } = this;
      this.onEditNode({ ...node, label });
    },
    onEditNode(newValue: WorkflowNode): void {
      this.$emit('edit:node', newValue);
    },
    onUpdateMethodOption(option: Process): void {
      const { node } = this;
      this.onEditNode({ ...node, value: option });
    },
    onEditMethodLabel(label: string): void {
      if (this.method === null) return;
      const { node, method } = this;
      const newMethod: Process = { ...method, label };
      this.onEditNode({ ...node, value: newMethod });
      this.onEditMethod(newMethod);
    },
    onInputMethodAPI(api: string): void {
      if (this.method === null) return;
      const { node, method } = this;
      const newMethod: Process = { ...method, api };
      this.onEditNode({ ...node, value: newMethod });
      this.onEditMethod(newMethod);
    },
    onCreateMethod(): void {
      this.$emit('create:method');
    },
    onEditMethod(newValue: Process): void {
      this.$emit('edit:method', newValue);
    },
    onClickMenuOfModelsOption(option: ModelService): void {
      if (this.method === null) return;
      const { node, method } = this;
      this.onEditNode({
        ...node,
        value: { ...method, model: option },
      });
    },
    onInputModelLabel(label: string): void {
      if (this.method === null) return;
      const { node, method, model } = this;
      const newModel: ModelService = {
        ...(model as ModelService),
        label,
      };
      this.onEditNode({
        ...node,
        value: { ...method, model: newModel },
      });
      this.onEditModel(newModel);
    },
    onInputModelAPI(api: string): void {
      if (this.method === null) return;
      const { node, method, model } = this;
      const newModel = { ...(model as ModelService), api };
      this.onEditNode({
        ...node,
        value: { ...method, model: newModel },
      });
      this.onEditModel(newModel);
    },
    onCreateModel(): void {
      this.$emit('create:model');
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit:model', newValue);
    },
    onEditInstanceInputList(inputs: string[]): void {
      if (this.method === null) return;
      const { node, method } = this;
      const newMethod = { ...method, inputs };
      this.onEditNode({ ...node, value: newMethod });
      this.onEditMethod(newMethod);
    },
  },
});
</script>
<style>
/** Make the letter spacing of v-text-field the same as text outside. */
.parameter-panel input {
  letter-spacing: .0071428571em;
}
</style>
