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
                  style="width: 7em"
                >
                  built-in
                </p>
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
            :class="`mt-3 ${classNameOfProcessOutputWidget}`"
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
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { StoppageAnalysisMethod } from '@/commons/types';
import { StoppageAnalysisNode } from './types';

export default Vue.extend({
  name: 'TheNodeDetailsStoppageAnalysis',
  props: {
    methods: {
      type: Array as PropType<StoppageAnalysisMethod[]>,
      default: [],
    },
    node: {
      type: Object as PropType<StoppageAnalysisNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Stoppage Analysis Instantiation',
      processInputNames: [
        'labels',
        'model',
        'features',
        'dataObjects',
      ],
      processInputNamesOfRequired: [
        'labels',
      ],
      processOutputName: 'stop',
      classNameOfPanel: 'parameter-panel',
      classNameOfCheckbox: 'parameter-panel-checkbox',
      classNameOfProcessOutputWidget: 'parameter-panel-process-output',
      isTitleEditable: false,
    };
  },
  computed: {
    method(): StoppageAnalysisMethod {
      return this.node.value.method;
    },
    menuOfMethods() {
      return {
        title: 'Method',
        options: this.methods,
        optionsText: this.methods.map((d) => d.name),
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
    onEditNode(newValue: StoppageAnalysisNode): void {
      this.$emit('edit-node', newValue);
    },
    onClickMenuOfMethodsOption(option: StoppageAnalysisMethod): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: { method: option },
      });
    },
    onInputMethodName(name: string): void {
      const { node, method } = this;
      this.onEditNode({
        ...node,
        value: {
          method: { ...method, name },
        },
      });
      this.onEditMethod({ ...method, name });
    },
    onEditMethod(newValue: StoppageAnalysisMethod): void {
      this.$emit('edit-method', this.node.type, newValue);
    },
    onClickParameterCheckbox(processInputNames: string[]): void {
      const {
        node,
        processInputNamesOfRequired,
        method,
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
        },
      });
      this.onEditMethod({ ...method, parameters: sorted });
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
