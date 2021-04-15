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
      Feature Extraction Instantiation
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
            @input="onInputTitle($event)"
          />
          <v-btn
            title="edit"
            x-small
            icon
            tile
            @click="onClickEditTitle"
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
        <v-list-item
          class="py-0"
        >
          <v-list-item-title
            class="subtitle-2"
            style="user-select: none"
          >
            Method
          </v-list-item-title>
          <v-menu offset-y>
            <template #activator="{ on }">
              <v-btn
                class="subtitle-2 text-none"
                style="border-radius: 2px"
                small
                v-on="on"
              >
                {{ node.value.name }}
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item
                v-for="(text, i) in menu.optionsText"
                :key="i"
                @click="onClickMenuOption(menu.options[i])"
              >
                <v-list-item-title class="subtitle-2">
                  {{ text }}
                </v-list-item-title>
                <p
                  v-if="menu.options[i].serverless"
                  class="subtitle-2 text-right ma-1 grey--text"
                  style="width: 5em"
                >
                  serverless
                </p>
                <p
                  v-if="menu.options[i].isBuiltIn"
                  class="subtitle-2 text-right ma-1 grey--text"
                  style="width: 6em"
                >
                  built-in
                </p>
              </v-list-item>
              <v-list-item @click="onCreateOption">
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
            :value="node.value.name"
            :disabled="node.value.isBuiltIn"
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
          API
          <v-text-field
            :value="node.value.serverless ? 'serverless' : node.value.api"
            :disabled="node.value.isBuiltIn"
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
            :value="node.value.parameters"
            :items="parameterNames"
            :disabled="node.value.isBuiltIn"
            class="mt-3"
            label="Process Input"
            outlined
            dense
            chips
            small-chips
            multiple
            hide-details
            @input="onClickParameterCheckbox($event)"
          >
            <template #selection="data">
              <v-chip
                v-bind="data.attrs"
                :input-value="data.selected"
                small
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
                  :value="node.value.parameters.findIndex((d) => d === data.item) >= 0"
                  :input-value="node.value.parameters.findIndex((d) => d === data.item) >= 0"
                  :disabled="compulsoryParameters.findIndex((d) => d === data.item) >= 0"
                  class="ma-0"
                  dense
                  hide-details
                />
              </v-list-item-content>
            </template>
          </v-autocomplete>
        </v-list-item>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  FeatureExtractionMethod,
} from '@/commons/types';
import { FeatureExtractionNode } from './types';

export default Vue.extend({
  name: 'TheNodeParameterViewFeatureExtraction',
  props: {
    methods: {
      type: Array as PropType<FeatureExtractionMethod[]>,
      default: [],
    },
    node: {
      type: Object as PropType<FeatureExtractionNode>,
      default: null,
    },
  },
  data() {
    return {
      parameterNames: [
        'dataObjects',
        'labels',
      ],
      compulsoryParameters: [
        'dataObjects',
      ],
      classNameOfPanel: 'parameter-panel',
      classNameOfCheckbox: 'parameter-panel-checkbox',
      isTitleEditable: false,
    };
  },
  computed: {
    menu() {
      return {
        title: 'Method',
        options: this.methods,
        optionsText: this.methods.map((d) => d.name),
      };
    },
  },
  methods: {
    onClickMenuOption(option: FeatureExtractionMethod): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: option,
      });
    },
    onClickEditTitle(): void {
      this.isTitleEditable = true;
    },
    onClickOutsideInputTitle(): void {
      this.isTitleEditable = false;
    },
    onInputTitle(title: string): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        title,
      });
    },
    onInputMethodName(name: string): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: { ...node.value, name },
      });
      this.onEditMethod({
        ...node.value,
        name,
      });
    },
    onInputMethodAPI(api: string): void {
      const { node } = this;
      this.onEditNode({
        ...node,
        value: { ...node.value, api },
      });
      this.onEditMethod({
        ...node.value,
        api,
      });
    },
    onClickParameterCheckbox(parameterNames: string[]): void {
      const { node, compulsoryParameters } = this;
      const orders = this.parameterNames;
      const sorted = [
        ...compulsoryParameters,
        ...parameterNames.filter((d) => compulsoryParameters.indexOf(d) < 0),
      ].sort((a, b) => (
        orders.indexOf(a) - orders.indexOf(b)
      ));
      this.onEditNode({
        ...node,
        value: {
          ...node.value,
          parameters: sorted,
        },
      });
      this.onEditMethod({
        ...node.value,
        parameters: sorted,
      });
    },
    onCreateOption(): void {
      this.$emit('create-option');
    },
    onEditNode(newValue: FeatureExtractionNode): void {
      this.$emit('edit-node', newValue);
    },
    onEditMethod(newValue: FeatureExtractionMethod): void {
      this.$emit('edit-method', newValue);
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
</style>
