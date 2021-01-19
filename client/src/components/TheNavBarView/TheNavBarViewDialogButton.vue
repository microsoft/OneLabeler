<template>
  <VDialogButton
    max-width="500px"
    :button-icon="$vuetify.icons.values.config"
    button-text="Settings"
    dialog-header-title="Settings"
  >
    <template #dialog-header-title>
      <span
        class="title"
        style="user-select: none"
      >
        Settings
      </span>

      <!-- The configuration upload button. -->
      <VUploadButton
        title="Open Configuration File"
        type="file"
        color="grey"
        small
        :icon="$vuetify.icons.values.open"
        @upload-file="onUploadFile"
      />

      <!-- The configuration export button. -->
      <v-btn
        title="Export Configuration"
        color="grey"
        icon
        tile
        small
        @click="onClickExport"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.save
        </v-icon>
      </v-btn>

      <!-- The configuration reset button. -->
      <v-btn
        title="Reset Settings"
        color="grey"
        icon
        tile
        small
        @click="onClickReset"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.reset
        </v-icon>
      </v-btn>
    </template>

    <!-- The configuration menus. -->
    <template #dialog-body>
      <v-container class="pa-0">
        <VMenusFlat
          :title="'Workflow Parameters'"
          :menus-config="menusConfig"
          :selected-options="settings"
          @click-menu-option="onClickMenuOption"
        />
      </v-container>
    </template>
  </VDialogButton>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
import {
  DefaultLabelingModelType,
  IMessage,
  Label,
  MessageType,
} from '@/commons/types';
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import VDialogButton from './VDialogButton.vue';
import VUploadButton from './VUploadButton.vue';
import VMenusFlat from './VMenusFlat.vue';

type WorkflowConfigData = {
  classes: Label[],
  defaultLabelingModelType: DefaultLabelingModelType,
  showDatasetOverview: boolean,
  nBatch: number,
  itemsPerRow: number,
  itemsPerCol: number,
}

const ajv = new Ajv();
const schema: JSONSchemaType<Partial<WorkflowConfigData>> = {
  type: 'object',
  properties: {
    classes: {
      type: 'array',
      items: { type: 'string' },
    },
    defaultLabelingModelType: { type: 'string' },
    showDatasetOverview: { type: 'boolean' },
    nBatch: { type: 'integer' },
    itemsPerRow: { type: 'integer' },
    itemsPerCol: { type: 'integer' },
  },
  additionalProperties: false,
};
const validate = ajv.compile(schema);

/** Compute alert message according to the error message when validation failed. */
const computeErrorMessage = (err: DefinedError): IMessage | null => {
  if (err.keyword === 'required') {
    return {
      content: `UPLOAD FAILED: ${err.message}.`,
      type: MessageType.error,
    };
  }
  if (err.keyword === 'type') {
    return {
      content: `UPLOAD FAILED: ${err.dataPath} ${err.message}.`,
      type: MessageType.error,
    };
  }
  if (err.keyword === 'additionalProperties') {
    return {
      content: `UPLOAD FAILED: ${err.message} '${err.params.additionalProperty}'.`,
      type: MessageType.error,
    };
  }
  return null;
};

export default Vue.extend({
  name: 'TheNavBarViewDialogButton',
  components: {
    VDialogButton,
    VMenusFlat,
    VUploadButton,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  data() {
    return {
      menusConfig: {
        itemsPerRow: {
          title: 'Data Objects Per Row',
          options: [1, 4, 8, 12],
          optionsText: ['1', '4', '8', '12'],
        },
        itemsPerCol: {
          title: 'Data Objects Per Column',
          options: [1, 2, 4, 6, 8],
          optionsText: ['1', '2', '4', '6', '8'],
        },
        nBatch: {
          title: 'Data Objects Per Sampled Batch',
          options: [1, 4, 16, 32, 48, 64, 96],
          optionsText: ['1', '4', '16', '32', '48', '64', '96'],
        },
        showDatasetOverview: {
          title: 'Show Dataset Overview',
          options: [false, true],
          optionsText: ['No', 'Yes'],
        },
        defaultLabelingModelType: {
          title: 'Default Labeling Model',
          options: [
            DefaultLabelingModelType.Null,
            DefaultLabelingModelType.Random,
            DefaultLabelingModelType.DecisionTree,
            DefaultLabelingModelType.SVM,
            DefaultLabelingModelType.LogisticRegression,
            DefaultLabelingModelType.LabelSpreading,
            DefaultLabelingModelType.RestrictedBoltzmannMachine,
          ],
          optionsText: [
            'Null',
            'Random',
            'Decision Tree',
            'SVM',
            'Logistic Regression',
            'Label Spreading',
            'Restricted Boltzmann Machine',
          ],
        },
      },
    };
  },
  computed: {
    ...mapState('workflow', [
      'classes',
      'showDatasetOverview',
      'defaultLabelingModelType',
      'nBatch',
      'itemsPerRow',
      'itemsPerCol',
    ]),
    settings() {
      const {
        showDatasetOverview,
        defaultLabelingModelType,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      } = this;
      return {
        showDatasetOverview,
        defaultLabelingModelType,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      };
    },
  },
  methods: {
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'setClasses',
      'setDefaultLabelingModelType',
      'setShowDatasetOverview',
      'setNBatch',
      'setItemsPerRow',
      'setItemsPerCol',
    ]),
    onClickExport(): void {
      const {
        classes,
        showDatasetOverview,
        defaultLabelingModelType,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      } = this;
      saveObjectAsJSONFile({
        classes,
        showDatasetOverview,
        defaultLabelingModelType,
        nBatch,
        itemsPerRow,
        itemsPerCol,
      }, 'workflow.config.json');
    },
    onClickReset(): void {
      // reset workflow configurations
      this.setClasses([]);
      this.setShowDatasetOverview(false);
      this.setDefaultLabelingModelType(DefaultLabelingModelType.Null);
      this.setNBatch(32);
      this.setItemsPerRow(8);
      this.setItemsPerCol(4);
    },
    onClickMenuOption(menuKey: string, option: unknown): void {
      if (menuKey === 'defaultLabelingModelType') {
        this.setDefaultLabelingModelType(option as DefaultLabelingModelType);
      }
      if (menuKey === 'showDatasetOverview') {
        this.setShowDatasetOverview(option as boolean);
      }
      if (menuKey === 'nBatch') {
        this.setNBatch(option as number);
      }
      if (menuKey === 'itemsPerRow') {
        this.setItemsPerRow(option as number);
      }
      if (menuKey === 'itemsPerCol') {
        this.setItemsPerCol(option as number);
      }
    },
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const config = await JSONFileToObject(file);
      if (validate(config)) {
        if ('classes' in config) {
          this.setClasses(config.classes);
        }
        if ('defaultLabelingModelType' in config) {
          this.setDefaultLabelingModelType(config.defaultLabelingModelType);
        }
        if ('showDatasetOverview' in config) {
          this.setShowDatasetOverview(config.showDatasetOverview);
        }
        if ('nBatch' in config) {
          this.setNBatch(config.nBatch);
        }
        if ('itemsPerRow' in config) {
          this.setItemsPerRow(config.itemsPerRow);
        }
        if ('itemsPerCol' in config) {
          this.setItemsPerCol(config.itemsPerCol);
        }
        this.setMessage({
          content: 'Workflow Configuration Uploaded.',
          type: MessageType.success,
        });
      } else {
        const errors = validate.errors as DefinedError[];
        const message = computeErrorMessage(errors[0]);
        this.setMessage(message);
      }
    },
  },
});
</script>
