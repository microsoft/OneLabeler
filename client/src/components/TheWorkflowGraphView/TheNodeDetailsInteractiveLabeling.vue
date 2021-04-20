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
                    <v-list-item-content
                      dense
                      :class="classNameOfCheckbox"
                    >
                      <v-checkbox
                        :label="data.item.name"
                        :value="selectedMethods.findIndex((d) => d.id === data.item.id) >= 0"
                        :input-value="selectedMethods.findIndex((d) => d.id === data.item.id) >= 0"
                        class="ma-0"
                        dense
                        hide-details
                      />
                    </v-list-item-content>
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

          <template v-if="method.configuration !== undefined">
            <v-card
              class="mx-4 mb-2"
              outlined
            >
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
  InteractiveLabelingMethod,
} from '@/commons/types';
import { InteractiveLabelingNode } from './types';

export default Vue.extend({
  name: 'TheNodeDetailsInteractiveLabeling',
  props: {
    methods: {
      type: Array as PropType<InteractiveLabelingMethod[]>,
      default: () => [],
    },
    node: {
      type: Object as PropType<InteractiveLabelingNode>,
      default: null,
    },
  },
  data() {
    return {
      viewTitle: 'Interactive Labeling Instantiation',
      processInputNames: [
        'dataObjects',
        'samples',
      ],
      processInputNamesOfRequired: [
        'dataObjects',
        'samples',
      ],
      processOutputName: 'labels',
      classNameOfPanel: 'parameter-panel',
      classNameOfCheckbox: 'parameter-panel-checkbox',
      classNameOfProcessOutputWidget: 'parameter-panel-process-output',
      isTitleEditable: false,
    };
  },
  computed: {
    selectedMethods(): InteractiveLabelingMethod[] {
      return this.node.value.map((d) => d.method);
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
    onEditNode(newValue: InteractiveLabelingNode): void {
      this.$emit('edit-node', newValue);
    },
    onClickMenuOfMethodsOption(options: InteractiveLabelingMethod[]): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: options.map((d) => ({ method: d })),
      });
    },
    onClickMethodConfiguration(
      method: InteractiveLabelingMethod,
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
    onEditMethod(newValue: InteractiveLabelingMethod): void {
      this.$emit('edit-method', this.node.type, newValue);
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
