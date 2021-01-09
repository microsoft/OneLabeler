<template>
  <VDialogButton
    max-width="400px"
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
import { saveObjectAsJSONFile, JSONFileToObject } from '@/plugins/json-utils';
import VDialogButton from './VDialogButton.vue';
import VUploadButton from './VUploadButton.vue';
import VMenusFlat from './VMenusFlat.vue';

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
      },
    };
  },
  computed: {
    ...mapState('workflow', [
      'classes',
      'nBatch',
      'itemsPerRow',
      'itemsPerCol',
      'showDatasetOverview',
    ]),
    settings() {
      const {
        itemsPerRow,
        itemsPerCol,
        nBatch,
        showDatasetOverview,
      } = this;
      return {
        itemsPerRow,
        itemsPerCol,
        nBatch,
        showDatasetOverview,
      };
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setClasses',
      'setNBatch',
      'setItemsPerRow',
      'setItemsPerCol',
      'setShowDatasetOverview',
    ]),
    onClickExport(): void {
      const {
        classes,
        nBatch,
        itemsPerRow,
        itemsPerCol,
        showDatasetOverview,
      } = this;
      saveObjectAsJSONFile({
        classes,
        nBatch,
        itemsPerRow,
        itemsPerCol,
        showDatasetOverview,
      }, 'workflow.config.json');
    },
    onClickReset(): void {
      // reset workflow configurations
      this.setClasses([]);
      this.setNBatch(32);
      this.setItemsPerRow(8);
      this.setItemsPerCol(4);
      this.setShowDatasetOverview(false);
    },
    onClickMenuOption(menuKey: string, option: unknown): void {
      if (menuKey === 'itemsPerRow') {
        this.setItemsPerRow(option as number);
      }
      if (menuKey === 'itemsPerCol') {
        this.setItemsPerCol(option as number);
      }
      if (menuKey === 'nBatch') {
        this.setNBatch(option as number);
      }
      if (menuKey === 'showDatasetOverview') {
        this.setShowDatasetOverview(option as boolean);
      }
    },
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const config = await JSONFileToObject(file);
      if ('classes' in config) {
        this.setClasses(config.classes);
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
      if ('showDatasetOverview' in config) {
        this.setShowDatasetOverview(config.showDatasetOverview);
      }
    },
  },
});
</script>
