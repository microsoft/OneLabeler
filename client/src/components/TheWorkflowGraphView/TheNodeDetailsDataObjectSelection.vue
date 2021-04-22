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

        <!-- The methods used to instantiated the process. -->
        <v-list-item>
          <VNodeSelectMethodMultiple
            :selected-methods="selectedMethods"
            :menu="menuOfMethods"
            append-create-option
            @update:selections="onUpdateMethodOptions"
            @create:option="onCreateMethod"
          />
        </v-list-item>

        <!-- for each of the selected method -->
        <v-container
          v-for="(method, i) in selectedMethods"
          :key="i"
          class="pa-0 pt-2 pb-0"
        >
          <v-divider />

          <!-- The name of the method. -->
          <v-list-item class="pt-2">
            <VNodeEditableMethodName
              :title="method.name"
              :disabled="method.isBuiltIn"
              style="width: 100%"
              @edit:title="onEditMethodName(method, $event)"
            />
          </v-list-item>

          <!-- The input and output of the process. -->
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
                  @edit:list="onEditInstanceInputList(method, $event)"
                />
              </v-col>
              <v-col style="width: 25%; max-width: 25%; flex-basis: 25%">
                <!-- The display of process output parameters. -->
                <VNodeOutput :process-output="processOutput" />
              </v-col>
            </v-row>
          </v-list-item>

          <!-- The url of the method service. -->
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
                @input="onInputMethodAPI(method, $event)"
              />
            </v-card>
          </v-list-item>

          <template v-if="method.inputs.findIndex((d) => d === 'model') >= 0">
            <v-card
              class="mx-4 mt-2"
              outlined
            >
              <!-- The model used as input to the process. -->
              <v-list-item>
                <VNodeSelectModel
                  :selected-model="model"
                  :menu="menuOfModels"
                  append-create-option
                  @update:selection="onClickMenuOfModelsOption(method, $event)"
                  @create:option="onCreateModel"
                />
              </v-list-item>

              <template v-if="model !== undefined">
                <!-- The name of the model. -->
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
                    @input="onInputModelName(method, $event)"
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
                    @input="onInputModelAPI(method, $event)"
                  />
                </v-list-item>
              </template>
            </v-card>
          </template>

          <v-list-item
            v-if="method.params !== undefined"
            class="pt-2"
          >
            <VNodeMethodParams
              :params="method.params"
              style="width: 100%"
              @click:param-option="onClickMethodParam(
                method,
                $event.paramName,
                $event.option,
              )"
            />
          </v-list-item>
        </v-container>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  ModelService,
  DataObjectSelectionMethod,
  DataObjectSelectionNode,
  MethodParams,
} from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodName from './VNodeEditableMethodName.vue';
import VNodeEditableTitle from './VNodeEditableTitle.vue';
import VNodeMethodParams from './VNodeMethodParams.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodMultiple from './VNodeSelectMethodMultiple.vue';
import VNodeSelectModel from './VNodeSelectModel.vue';

export default Vue.extend({
  name: 'TheNodeDetailsDataObjectSelection',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodName,
    VNodeEditableTitle,
    VNodeMethodParams,
    VNodeOutput,
    VNodeSelectMethodMultiple,
    VNodeSelectModel,
  },
  props: {
    models: {
      type: Array as PropType<ModelService[]>,
      default: () => [],
    },
    methods: {
      type: Array as PropType<DataObjectSelectionMethod[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<DataObjectSelectionNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Data Object Selection Instantiation',
      processInputList: [
        'labels',
        'features',
        'model',
        'samples',
      ],
      processInputListOfRequired: ['labels'],
      processOutput: 'samples',
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    selectedMethods(): DataObjectSelectionMethod[] {
      return this.node.value.map((d) => d.method);
    },
    model(): ModelService | undefined {
      const algorithmicInstantiation = this.node.value
        .find((d) => d.model !== undefined);
      if (algorithmicInstantiation === undefined) {
        return undefined;
      }
      return algorithmicInstantiation.model;
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
        options: this.models.map((d) => ({
          value: d,
          text: d.name,
        })),
      };
    },
  },
  methods: {
    onEditNodeTitle(title: string): void {
      const { node } = this;
      this.onEditNode({ ...node, title });
    },
    onEditNode(newValue: DataObjectSelectionNode): void {
      this.$emit('edit:node', newValue);
    },
    onUpdateMethodOptions(options: DataObjectSelectionMethod[]): void {
      const { node } = this;

      // Ensure at most one algorithmic option is chosen.
      const algorithmicIds = options
        .filter((d) => d.isAlgorithmic)
        .map((d) => d.id);
      let newOptions = options;
      if (algorithmicIds.length >= 2) {
        const oldAlgorithmicIds = node.value
          .map((d) => d.method)
          .filter((d) => d.isAlgorithmic)
          .map((d) => d.id);
        newOptions = options.filter((d) => (
          !(oldAlgorithmicIds.indexOf(d.id) >= 0)
        ));
      }
      this.onEditNode({
        ...node,
        value: newOptions.map((d) => ({ method: d })),
      });
    },
    onEditMethodName(method: DataObjectSelectionMethod, name: string): void {
      const { node, model } = this;
      const newMethod = { ...method, name };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method: newMethod, model }
            : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onInputMethodAPI(method: DataObjectSelectionMethod, api: string): void {
      const { node, model } = this;
      const newMethod = { ...method, api };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method: newMethod, model }
            : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onClickMethodParam(
      method: DataObjectSelectionMethod,
      paramName: string,
      option: { value: unknown, text: string },
    ): void {
      const { node, model } = this;
      const { params } = method;
      const newMethod = {
        ...method,
        params: {
          ...params,
          [paramName]: {
            ...(params as MethodParams)[paramName],
            value: option.value,
          },
        },
      };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method: newMethod, model }
            : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onCreateMethod(): void {
      this.$emit('create:method');
    },
    onEditMethod(newValue: DataObjectSelectionMethod): void {
      this.$emit('edit:method', this.node.type, newValue);
    },
    onClickMenuOfModelsOption(method: DataObjectSelectionMethod, option: ModelService): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method, model: option }
            : d
        )),
      });
    },
    onInputModelName(method: DataObjectSelectionMethod, name: string): void {
      const { node, model } = this;
      const newModel = { ...(model as ModelService), name };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method, model: newModel }
            : d
        )),
      });
      this.onEditModel(newModel);
    },
    onInputModelAPI(method: DataObjectSelectionMethod, api: string): void {
      const { node, model } = this;
      const newModel = { ...(model as ModelService), api };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method, model: newModel }
            : d
        )),
      });
      this.onEditModel(newModel);
    },
    onCreateModel(): void {
      this.$emit('create:model');
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit:model', newValue);
    },
    onEditInstanceInputList(
      method: DataObjectSelectionMethod,
      inputs: string[],
    ): void {
      const { node, model } = this;
      const newMethod = { ...method, inputs };
      this.onEditNode({
        ...node,
        value: node.value.map((d) => (
          d.method.id === method.id
            ? { method: newMethod, model }
            : d
        )),
      });
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
