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
          Node Name
          <template v-if="!isTitleEditable">
            <span class="pl-4 subtitle-2">
              {{ node.title }}
            </span>
            <v-spacer />
          </template>
          <v-text-field
            v-else
            v-click-outside="onClickOutsideInputTitle"
            :value="node.title"
            :disabled="false"
            class="ma-0 pl-4 pt-1 subtitle-2"
            style="padding-bottom: 6px !important; letter-spacing: 0.01em !important"
            type="text"
            dense
            hide-details
            single-line
            @input="onInputNodeTitle($event)"
          />
          <v-btn
            title="edit"
            x-small
            icon
            tile
            @click="onClickEditNodeTitle"
          >
            <v-icon
              aria-hidden="true"
              class="px-0"
              small
            >
              $vuetify.icons.values.edit
            </v-icon>
          </v-btn>
        </v-list-item>

        <!-- The methods used to instantiated the process. -->
        <v-list-item class="mb-2 pa-0">
          <v-container class="ma-0">
            <v-row>
              <v-col
                class="py-0 pl-4"
                style="width: 20%; max-width: 20%; flex-basis: 20%; height: 40px"
              >
                <span>Selected Methods</span>
              </v-col>
              <v-col
                class="py-0 pl-0 pr-4"
                style="width: 80%; max-width: 80%; flex-basis: 80%"
              >
                <v-autocomplete
                  :value="selectedMethods"
                  :items="methods"
                  outlined
                  dense
                  multiple
                  full-width
                  hide-details
                  @input="onClickMenuOfMethodsOption($event)"
                >
                  <template #selection="data">
                    <v-chip
                      v-bind="data.attrs"
                      :input-value="data.selected"
                      small
                      label
                      outlined
                    >
                      {{ data.item.name }}
                    </v-chip>
                  </template>
                  <template #item="data">
                    <v-list-item-title>
                      <v-checkbox
                        :label="data.item.name"
                        :value="selectedMethods.findIndex((d) => d.id === data.item.id) >= 0"
                        :input-value="selectedMethods.findIndex((d) => d.id === data.item.id) >= 0"
                        class="my-0 parameter-panel-checkbox"
                        dense
                        hide-details
                      />
                    </v-list-item-title>
                    <p
                      v-if="!data.item.algorithmic"
                      class="subtitle-2 text-right ma-1 grey--text"
                    >
                      interface
                    </p>
                    <p
                      v-if="data.item.serverless"
                      class="subtitle-2 text-right ma-1 grey--text"
                    >
                      serverless
                    </p>
                    <p
                      v-if="data.item.isBuiltIn"
                      class="subtitle-2 text-right grey--text ma-1"
                      style="white-space: nowrap"
                    >
                      built-in
                    </p>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
        </v-list-item>

        <!-- for each of the selected method -->
        <v-container
          v-for="(method, i) in selectedMethods"
          :key="i"
          class="pa-0"
        >
          <v-divider />

          <!-- The name of the method. -->
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
            />
          </v-list-item>

          <!-- The input box for process input parameters. -->
          <v-list-item>
            <v-autocomplete
              :value="method.parameters"
              :items="processInputNames"
              :disabled="method.isBuiltIn"
              class="mt-3"
              label="Process Input"
              outlined
              dense
              multiple
              hide-details
            >
              <template #selection="data">
                <v-chip
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  color="#FF7F0E"
                  text-color="black"
                  small
                  outlined
                >
                  {{ data.item }}
                </v-chip>
              </template>
              <template #item="data">
                <v-list-item-content
                  dense
                  :class="classNameOfCheckbox"
                >
                  <v-checkbox
                    :label="data.item"
                    :value="method.parameters.findIndex((d) => d === data.item) >= 0"
                    :input-value="method.parameters.findIndex((d) => d === data.item) >= 0"
                    :disabled="processInputNamesOfRequired.findIndex((d) => d === data.item) >= 0"
                    class="ma-0"
                    dense
                    hide-details
                  />
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-list-item>

          <!-- The display of process output parameters. -->
          <v-list-item>
            <v-autocomplete
              :value="processOutputName"
              :items="[processOutputName]"
              :class="`mt-3 pb-2 ${classNameOfProcessOutputWidget}`"
              label="Process Output"
              disabled
              outlined
              dense
              hide-details
            >
              <template #selection>
                <v-chip
                  color="#FF7F0E"
                  text-color="black"
                  small
                  outlined
                >
                  {{ processOutputName }}
                </v-chip>
              </template>
            </v-autocomplete>
          </v-list-item>

          <template v-if="method.parameters.findIndex((d) => d === 'model') >= 0">
            <v-card
              class="mx-4 mb-2"
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
                      {{ model === undefined ? '' : model.name }}
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item
                      v-for="(text, modelIdx) in menuOfModels.optionsText"
                      :key="modelIdx"
                      @click="onClickMenuOfModelsOption(method, menuOfModels.options[modelIdx])"
                    >
                      <v-list-item-title class="subtitle-2">
                        {{ text }}
                      </v-list-item-title>
                      <p
                        v-if="menuOfModels.options[modelIdx].serverless"
                        class="subtitle-2 text-right ma-1 grey--text"
                        style="width: 5em"
                      >
                        serverless
                      </p>
                      <p
                        v-if="menuOfModels.options[modelIdx].isBuiltIn"
                        class="subtitle-2 text-right ma-1 grey--text"
                        style="width: 6em"
                      >
                        built-in
                      </p>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>

              <template v-if="model !== undefined">
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
                    @input="onInputModelName(method, $event)"
                  />
                </v-list-item>

                <!-- The url of the model. -->
                <v-list-item>
                  Model Key
                  <v-text-field
                    :value="model.serverless ? 'serverless' : model.objectId"
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

          <template v-if="method.configuration !== undefined">
            <v-card
              class="mx-4 mb-2"
              outlined
            >
              <!-- The configuration of the method. -->
              <v-list-item
                v-for="(entry, key) in method.configuration"
                :key="key"
                class="py-0"
              >
                <v-list-item-title
                  class="subtitle-2"
                  style="user-select: none"
                >
                  {{ entry.title }}
                </v-list-item-title>
                <v-menu offset-y>
                  <template #activator="{ on }">
                    <v-btn
                      class="subtitle-2 text-none"
                      style="border-radius: 2px"
                      small
                      v-on="on"
                    >
                      {{ entry.options
                        .find((d) => d.value === entry.value)
                        .text }}
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item
                      v-for="(option, optionIdx) in entry.options"
                      :key="optionIdx"
                      @click="onClickMethodConfiguration(
                        method, key, option)"
                    >
                      <v-list-item-title class="subtitle-2">
                        {{ option.text }}
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>
            </v-card>
          </template>
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
} from '@/commons/types';
import { DataObjectSelectionNode } from './types';

export default Vue.extend({
  name: 'TheNodeDetailsDataObjectSelection',
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
      processInputNames: [
        'labels',
        'features',
        'model',
        'samples',
      ],
      processInputNamesOfRequired: [
        'labels',
      ],
      processOutputName: 'samples',
      classNameOfPanel: 'parameter-panel',
      classNameOfCheckbox: 'parameter-panel-checkbox',
      classNameOfProcessOutputWidget: 'parameter-panel-process-output',
      isTitleEditable: false,
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
      /*
      const algorithmicInstantiation = this.node.value
        .find((d) => d.method.parameters.findIndex((param) => param === 'model') >= -1);
      if (algorithmicInstantiation === undefined) {
        return undefined;
      }
      return algorithmicInstantiation.model;
      */
    },
    menuOfMethods() {
      return {
        title: 'Method',
        options: this.methods,
        optionsText: this.methods.map((d) => d.name),
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
    onClickEditNodeTitle(): void {
      this.isTitleEditable = true;
    },
    onClickOutsideInputTitle(): void {
      this.isTitleEditable = false;
    },
    onInputNodeTitle(title: string): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        title,
      });
    },
    onEditNode(newValue: DataObjectSelectionNode): void {
      this.$emit('edit-node', newValue);
    },
    onClickMenuOfMethodsOption(options: DataObjectSelectionMethod[]): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: options.map((d) => ({ method: d })),
      });
    },
    onClickMethodConfiguration(
      method: DataObjectSelectionMethod,
      configurationName: string,
      option: { value: unknown, text: string },
    ): void {
      const { node } = this;
      const { configuration } = method;
      const newMethod = {
        ...method,
        configuration: {
          ...configuration,
          [configurationName]: {
            ...configuration[configurationName],
            value: option.value,
          },
        },
      };

      this.onEditNode({
        ...node,
        value: node.value.map((d) => {
          if (d.method.id === method.id) {
            return { method: newMethod };
          }
          return d;
        }),
      });
      this.onEditMethod(newMethod);
    },
    onEditMethod(newValue: DataObjectSelectionMethod): void {
      this.$emit('edit-method', this.node.type, newValue);
    },
    onClickMenuOfModelsOption(method: DataObjectSelectionMethod, option: ModelService): void {
      const { node } = this;
      console.log('click menu of models', option);

      this.onEditNode({
        ...node,
        value: node.value.map((d) => {
          if (d.method.id === method.id) {
            return { method, model: option };
          }
          return d;
        }),
      });
    },
    onInputModelName(method: DataObjectSelectionMethod, name: string): void {
      const { node, model } = this;
      this.onEditNode({
        ...node,
        value: node.value.map((d) => {
          if (d.method.id === method.id) {
            return {
              method,
              model: { ...(model as ModelService), name },
            };
          }
          return d;
        }),
      });
      this.onEditModel({
        ...(model as ModelService),
        name,
      });
    },
    onInputModelAPI(method: DataObjectSelectionMethod, api: string): void {
      const { node, model } = this;
      this.onEditNode({
        ...node,
        value: node.value.map((d) => {
          if (d.method.id === method.id) {
            return {
              method,
              model: { ...(model as ModelService), api },
            };
          }
          return d;
        }),
      });
      this.onEditModel({
        ...(model as ModelService),
        api,
      });
    },
    onCreateModel(): void {
      this.$emit('create-model');
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit-model', newValue);
    },
    onClickRecompute(): void {
      this.$emit('click-recompute', this.node);
    },
  },
});
</script>
<style>
/** Make the letter spacing of v-text-field the same as text outside. */
.parameter-panel input {
  letter-spacing: .0071428571em;
}

/** Change the font of checkbox text. */
.parameter-panel-checkbox .v-label {
  font-size: 0.875rem !important;
}

/** Hide the menu trigger button for process-output. */
.parameter-panel-process-output .v-input__append-inner {
  display: none;
}
</style>
