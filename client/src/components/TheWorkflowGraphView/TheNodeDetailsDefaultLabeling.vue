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

        <!-- The method used to instantiated the process. -->
        <v-list-item
          class="py-0"
        >
          <v-list-item-title
            class="subtitle-2"
            style="user-select: none"
          >
            Selected Method
          </v-list-item-title>
          <v-menu offset-y>
            <template #activator="{ on }">
              <v-btn
                class="subtitle-2 text-none"
                style="border-radius: 2px"
                small
                v-on="on"
              >
                {{ method.name }}
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item
                v-for="(text, i) in menuOfMethods.optionsText"
                :key="i"
                @click="onClickMenuOfMethodsOption(menuOfMethods.options[i])"
              >
                <v-list-item-title class="subtitle-2">
                  {{ text }}
                </v-list-item-title>
                <p
                  v-if="menuOfMethods.options[i].serverless"
                  class="subtitle-2 text-right ma-1 grey--text"
                  style="width: 5em"
                >
                  serverless
                </p>
                <p
                  v-if="menuOfMethods.options[i].isBuiltIn"
                  class="subtitle-2 text-right ma-1 grey--text"
                  style="width: 6em"
                >
                  built-in
                </p>
              </v-list-item>
              <v-list-item @click="onCreateMethod">
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
            </v-list>
          </v-menu>
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
            @input="onInputMethodName($event)"
          />
        </v-list-item>

        <!-- The url of feature extraction service. -->
        <v-list-item>
          Method API
          <v-text-field
            :value="method.serverless ? 'serverless' : method.api"
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
            @input="onClickParameterCheckbox($event)"
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
                      v-if="menuOfModels.options[i].serverless"
                      class="subtitle-2 text-right ma-1 grey--text"
                      style="width: 5em"
                    >
                      serverless
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
                :value="model.serverless ? 'serverless' : model.objectId"
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

export default Vue.extend({
  name: 'TheNodeDetailsDefaultLabeling',
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
      processInputNames: [
        'features',
        'model',
      ],
      processInputNamesOfRequired: [
        'features',
      ],
      processOutputName: 'labels',
      classNameOfPanel: 'parameter-panel',
      classNameOfCheckbox: 'parameter-panel-checkbox',
      classNameOfProcessOutputWidget: 'parameter-panel-process-output',
      isTitleEditable: false,
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
      return this.method.parameters
        .findIndex((d) => d === 'model') >= 0;
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
    onEditNode(newValue: DefaultLabelingNode): void {
      this.$emit('edit-node', newValue);
    },
    onClickMenuOfMethodsOption(option: DefaultLabelingMethod): void {
      const { node, model } = this;
      this.onEditNode({
        ...node,
        value: {
          method: option,
          model,
        },
      });
    },
    onInputMethodName(name: string): void {
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
      this.$emit('create-method');
    },
    onEditMethod(newValue: DefaultLabelingMethod): void {
      this.$emit('edit-method', this.node.type, newValue);
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
      this.$emit('create-model');
    },
    onEditModel(newValue: ModelService): void {
      this.$emit('edit-model', newValue);
    },
    onClickParameterCheckbox(processInputNames: string[]): void {
      const {
        node,
        processInputNamesOfRequired,
        method,
        model,
      } = this;
      const orders = this.processInputNames;
      const sorted = [
        ...processInputNamesOfRequired,
        ...processInputNames.filter((d) => processInputNamesOfRequired.indexOf(d) < 0),
      ].sort((a, b) => (
        orders.indexOf(a) - orders.indexOf(b)
      ));
      this.onEditNode({
        ...node,
        value: {
          method: { ...method, parameters: sorted },
          model,
        },
      });
      this.onEditMethod({ ...method, parameters: sorted });
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
