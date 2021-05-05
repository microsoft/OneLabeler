<template>
  <v-card
    :class="`fill-height ${classNameOfPanel}`"
    style="width: 100%"
    tile
  >
    <v-card-title class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ viewTitle }}
      <v-spacer />
      <v-btn
        title="recompute"
        class="view-header-button mr-1"
        x-small
        icon
        @click="onClickRecompute"
      >
        <v-icon
          aria-hidden="true"
          class="px-0"
          small
        >
          $vuetify.icons.values.sync
        </v-icon>
      </v-btn>
    </v-card-title>
    <v-divider />
    <v-card-actions class="pa-0">
      <v-list
        style="width: 100%"
        dense
        subheader
      >
        <!-- The label of the process node. -->
        <v-list-item>
          <VNodeEditableLabel
            :label="node.label"
            @edit:label="onEditNodeLabel"
          />
        </v-list-item>

        <!-- The method used to instantiated the process. -->
        <v-list-item>
          <VNodeSelectMethodSingle
            :selected-method="method"
            :menu="menuOfMethods"
            append-create-option
            @update:selection="onUpdateMethodOption"
            @create:option="onCreateMethod"
          />
        </v-list-item>
        <v-divider />

        <template v-if="method !== null">

          <!-- The label of the feature extraction method. -->
          <v-list-item class="pt-2">
            <VNodeEditableMethodLabel
              :label="method.label"
              :disabled="method.isBuiltIn"
              style="width: 100%"
              @edit:label="onEditMethodLabel($event)"
            />
          </v-list-item>

          <v-list-item class="pt-2">
            <v-row>
              <v-col
                class="pr-0"
                style="width: 75%; max-width: 75%; flex-basis: 75%;"
              >
                <!-- The input box for process input parameters. -->
                <VNodeEditableInput
                  :process-input-list="processInputList"
                  :process-input-list-of-required="processInputListOfRequired"
                  :instance-input-list="method.inputs"
                  :disabled="method.isBuiltIn"
                  @edit:list="onEditInstanceInputList($event)"
                />
              </v-col>
              <v-col style="width: 25%; max-width: 25%; flex-basis: 25%">
                <!-- The display of process output parameters. -->
                <VNodeOutput :process-output="processOutput" />
              </v-col>
            </v-row>
          </v-list-item>

          <!-- The url of feature extraction service. -->
          <v-list-item class="pt-2">
            <v-card
              outlined
              style="width: 100%; display: flex; flex: 1 1 100%;"
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
          </v-list-item>

          <v-card
            v-if="isModelBased"
            class="mx-4 mt-2"
            outlined
          >
            <!-- The model used as input to the process. -->
            <v-list-item>
              <VNodeSelectModel
                :selected-model="model"
                :menu="menuOfModels"
                append-create-option
                @update:selection="onClickMenuOfModelsOption($event)"
                @create:option="onCreateModel"
              />
            </v-list-item>

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
      </v-list>
    </v-card-actions>
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
        label: 'Method',
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
    onClickRecompute(): void {
      this.$emit('click:recompute', this.node);
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
