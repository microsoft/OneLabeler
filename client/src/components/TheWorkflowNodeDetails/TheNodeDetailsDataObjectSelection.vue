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
        <!-- The label of the process node. -->
        <v-list-item>
          <VNodeEditableLabel
            :label="node.label"
            @edit:label="onEditNodeLabel"
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

          <!-- The label of the method. -->
          <v-list-item class="pt-2">
            <VNodeEditableMethodLabel
              :label="method.label"
              :disabled="method.isBuiltIn"
              style="width: 100%"
              @edit:label="onEditMethodLabel(method, $event)"
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
                    @input="onInputModelLabel(method, $event)"
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
                $event.paramKey,
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
  MethodParams,
  ModelService,
  Process,
  WorkflowNode,
} from '@/commons/types';
import VNodeEditableInput from './VNodeEditableInput.vue';
import VNodeEditableMethodLabel from './VNodeEditableMethodLabel.vue';
import VNodeEditableLabel from './VNodeEditableLabel.vue';
import VNodeMethodParams from './VNodeMethodParams.vue';
import VNodeOutput from './VNodeOutput.vue';
import VNodeSelectMethodMultiple from './VNodeSelectMethodMultiple.vue';
import VNodeSelectModel from './VNodeSelectModel.vue';

export default Vue.extend({
  name: 'TheNodeDetailsDataObjectSelection',
  components: {
    VNodeEditableInput,
    VNodeEditableMethodLabel,
    VNodeEditableLabel,
    VNodeMethodParams,
    VNodeOutput,
    VNodeSelectMethodMultiple,
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
    selectedMethods(): Process[] {
      return this.node.value as Process[];
    },
    model(): ModelService | undefined {
      const modelBasedMethod = (this.node.value as Process[])
        .find((d) => d.model !== undefined);
      return modelBasedMethod === undefined
        ? undefined
        : modelBasedMethod.model;
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
    onUpdateMethodOptions(options: Process[]): void {
      const { node } = this;

      // Ensure at most one algorithmic option is chosen.
      const algorithmicIds = options
        .filter((d) => d.isAlgorithmic)
        .map((d) => d.id);
      let newOptions = options;
      if (algorithmicIds.length >= 2) {
        const oldAlgorithmicIds = (node.value as Process[])
          .filter((d) => d.isAlgorithmic)
          .map((d) => d.id);
        newOptions = options.filter((d) => (
          !(oldAlgorithmicIds.indexOf(d.id) >= 0)
        ));
      }
      this.onEditNode({
        ...node,
        value: newOptions,
      });
    },
    onEditMethodLabel(method: Process, label: string): void {
      const { node } = this;
      const newMethod: Process = { ...method, label };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id ? newMethod : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onInputMethodAPI(method: Process, api: string): void {
      const { node } = this;
      const newMethod = { ...method, api };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id ? newMethod : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onClickMethodParam(
      method: Process,
      paramKey: string,
      option: { value: unknown, label: string },
    ): void {
      const { node } = this;
      const { params } = method;
      const newMethod = {
        ...method,
        params: {
          ...params,
          [paramKey]: {
            ...(params as MethodParams)[paramKey],
            value: option.value,
          },
        },
      };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id ? newMethod : d
        )),
      });
      this.onEditMethod(newMethod);
    },
    onCreateMethod(): void {
      this.$emit('create:method');
    },
    onEditMethod(newValue: Process): void {
      this.$emit('edit:method', newValue);
    },
    onClickMenuOfModelsOption(method: Process, option: ModelService): void {
      const { node } = this;
      const newMethod = { ...method, model: option };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id ? newMethod : d
        )),
      });
    },
    onInputModelLabel(method: Process, label: string): void {
      const { node, model } = this;
      const newModel: ModelService = {
        ...(model as ModelService),
        label,
      };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id
            ? { ...method, model: newModel }
            : d
        )),
      });
      this.onEditModel(newModel);
    },
    onInputModelAPI(method: Process, api: string): void {
      const { node, model } = this;
      const newModel = { ...(model as ModelService), api };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id
            ? { ...method, model: newModel }
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
      method: Process,
      inputs: string[],
    ): void {
      const { node } = this;
      const newMethod = { ...method, inputs };
      this.onEditNode({
        ...node,
        value: (node.value as Process[]).map((d) => (
          d.id === method.id ? newMethod : d
        )),
      });
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
