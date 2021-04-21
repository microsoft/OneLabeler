<template>
  <v-card
    :class="`fill-height ${classNameOfPanel}`"
    style="width: 100%"
    tile
  >
    <v-card-title
      class="view-header"
    >
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
        <!-- The name of the process node. -->
        <v-list-item>
          <VNodeEditableTitle
            :title="node.title"
            @edit:title="onEditNodeTitle"
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

        <!-- The name of the feature extraction method. -->
        <v-list-item>
          Method Name
          <v-text-field
            :value="method.name"
            :disabled="method.isBuiltIn"
            class="ma-0 pl-4 pt-1 subtitle-2"
            style="padding-bottom: 6px !important"
            type="text"
            dense
            hide-details
            single-line
            @input="onEditMethodName($event)"
          />
        </v-list-item>

        <!-- The url of feature extraction service. -->
        <v-list-item>
          Method API
          <v-text-field
            :value="method.isServerless ? 'isServerless' : method.api"
            :disabled="method.isBuiltIn"
            class="ma-0 pl-4 pt-1 subtitle-2"
            style="padding-bottom: 6px !important"
            type="text"
            dense
            hide-details
            single-line
            @input="onInputMethodAPI($event)"
          />
        </v-list-item>

        <!-- The input box for process input parameters. -->
        <v-list-item>
          <VNodeEditableInput
            :process-input-list="processInputList"
            :process-input-list-of-required="processInputListOfRequired"
            :instance-input-list="method.inputs"
            :disabled="method.isBuiltIn"
            @edit:list="onEditInstanceInputList"
          />
        </v-list-item>

        <!-- The display of process output parameters. -->
        <v-list-item>
          <VNodeOutput :process-output="processOutput" />
        </v-list-item>

        <template v-if="isModelRequired">
          <v-card
            class="mx-4"
            outlined
          >
            <!-- The model used as input to the process. -->
            <v-list-item
              class="py-0"
            >
              <v-list-item-title
                class="subtitle-2"
                style="user-select: none"
              >
                Model
              </v-list-item-title>
              <v-menu offset-y>
                <template #activator="{ on }">
                  <v-btn
                    class="subtitle-2 text-none"
                    style="border-radius: 2px"
                    small
                    v-on="on"
                  >
                    {{ model.name }}
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item
                    v-for="(text, i) in menuOfModels.optionsText"
                    :key="i"
                    @click="onClickMenuOfModelsOption(menuOfModels.options[i])"
                  >
                    <v-list-item-title class="subtitle-2">
                      {{ text }}
                    </v-list-item-title>
                    <p
                      v-if="menuOfModels.options[i].isServerless"
                      class="subtitle-2 text-right ma-1 grey--text"
                      style="width: 5em"
                    >
                      isServerless
                    </p>
                    <p
                      v-if="menuOfModels.options[i].isBuiltIn"
                      class="subtitle-2 text-right ma-1 grey--text"
                      style="width: 6em"
                    >
                      built-in
                    </p>
                  </v-list-item>
                  <!--
                  <v-list-item @click="onCreateModel">
                    <v-list-item-title class="subtitle-2">
                      <v-icon
                        aria-hidden="true"
                        class="pr-2"
                        x-small
                      >
                        $vuetify.icons.values.add
                      </v-icon>
                      Customize
                    </v-list-item-title>
                  </v-list-item>
                  -->
                </v-list>
              </v-menu>
            </v-list-item>

            <!-- The name of the feature extraction method. -->
            <v-list-item>
              Model Name
              <v-text-field
                :value="model.name"
                :disabled="model.isBuiltIn"
                class="ma-0 pl-4 pt-1 subtitle-2"
                style="padding-bottom: 6px !important"
                type="text"
                dense
                hide-details
                single-line
                @input="onInputModelName($event)"
              />
            </v-list-item>

            <!-- The url of the model. -->
            <v-list-item>
              Model Key
              <v-text-field
                :value="model.isServerless ? 'isServerless' : model.objectId"
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
  DefaultLabelingMethod,
} from '@/commons/types';
import { DefaultLabelingNode } from './types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableTitle from './VNodeEditableTitle.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodSingle from './VNodeSelectMethodSingle.vue';

export default Vue.extend({
  name: 'TheNodeDetailsDefaultLabeling',
  components: {
    VNodeEditableInput,
    VNodeEditableTitle,
    VNodeOutput,
    VNodeSelectMethodSingle,
  },
  props: {
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    methods: {
      type: Array as PropType<DefaultLabelingMethod[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<DefaultLabelingNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Default Labeling Instantiation',
      processInputList: [
        'features',
        'model',
      ],
      processInputListOfRequired: [
        'features',
      ],
      processOutput: 'labels',
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    method(): DefaultLabelingMethod {
      return this.node.value.method;
    },
    model(): ModelService | undefined {
      return this.node.value.model;
    },
    isModelRequired(): boolean {
      return this.method.inputs
        .findIndex((d) => d === 'model') >= 0;
    },
    menuOfMethods() {
      return {
        title: 'Method',
        options: this.methods.map((d) => ({
          value: d,
          text: d.name,
        })),
      };
    },
    menuOfModels() {
      return {
        title: 'Models',
        options: this.models,
        optionsText: this.models.map((d) => d.name),
      };
    },
  },
  methods: {
    onEditNodeTitle(title: string): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        title,
      });
    },
    onEditNode(newValue: DefaultLabelingNode): void {
      this.$emit('edit:node', newValue);
    },
    onUpdateMethodOption(option: DefaultLabelingMethod): void {
      const { node, model } = this;
      this.onEditNode({
        ...node,
        value: {
          method: option,
          model,
        },
      });
    },
    onEditMethodName(name: string): void {
      const { node, method, model } = this;
      this.onEditNode({
        ...node,
        value: {
          method: { ...method, name },
          model,
        },
      });
      this.onEditMethod({ ...method, name });
    },
    onInputMethodAPI(api: string): void {
      const { node, method, model } = this;
      this.onEditNode({
        ...node,
        value: {
          method: { ...method, api },
          model,
        },
      });
      this.onEditMethod({ ...method, api });
    },
    onCreateMethod(): void {
      this.$emit('create:method');
    },
    onEditMethod(newValue: DefaultLabelingMethod): void {
      this.$emit('edit:method', this.node.type, newValue);
    },
    onClickMenuOfModelsOption(option: ModelService): void {
      const { node, method } = this;
      this.onEditNode({
        ...node,
        value: {
          method,
          model: option,
        },
      });
    },
    onInputModelName(name: string): void {
      const { node, method, model } = this;
      this.onEditNode({
        ...node,
        value: {
          method,
          model: { ...(model as ModelService), name },
        },
      });
      this.onEditModel({
        ...(model as ModelService),
        name,
      });
    },
    onInputModelAPI(api: string): void {
      const { node, method, model } = this;
      this.onEditNode({
        ...node,
        value: {
          method,
          model: { ...(model as ModelService), api },
        },
      });
      this.onEditModel({
        ...(model as ModelService),
        api,
      });
    },
    onCreateModel(): void {
      this.$emit('create:model');
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit:model', newValue);
    },
    onEditInstanceInputList(instanceInputList: string[]): void {
      const {
        node,
        method,
        model,
      } = this;
      this.onEditNode({
        ...node,
        value: {
          method: { ...method, inputs: instanceInputList },
          model,
        },
      });
      this.onEditMethod({ ...method, inputs: instanceInputList });
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
