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
      Data Management
    </v-card-title>
    <v-divider />
    <div
      class="px-2"
      style="width: 100%"
    >
      <!-- The method used to instantiated the process. -->
      <div class="py-1">
        <VEditableService
          :label="'Source'"
          :service="sourceService"
          :options="sourceServices"
          :disabled="disabled"
          @select:service="onSelectSourceService"
          @edit:service="onEditSourceService"
          @create:service="onCreateSourceService"
        />
      </div>
      <div class="pb-1">
        <VEditableService
          :label="'Storage'"
          :service="storageService"
          :options="storageServices"
          :disabled="disabled"
          @select:service="onSelectStorageService"
          @edit:service="onEditStorageService"
          @create:service="onCreateStorageService"
        />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import {
  SourceType,
  SourceService,
  StorageType,
  StorageService,
} from '@/commons/types';
import VEditableService from './VEditableService.vue';

export default Vue.extend({
  name: 'TheDataManagementView',
  components: {
    VEditableService,
  },
  data() {
    return {
      classNameOfPanel: 'parameter-panel',
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'sourceService',
      'sourceServices',
      'storageService',
      'storageServices',
    ]),
    disabled(): boolean {
      return this.dataObjects !== null;
    },
  },
  methods: {
    ...mapActions([
      'setSourceService',
      'pushSourceServices',
      'editSourceService',
      'setStorageService',
      'pushStorageServices',
      'editStorageService',
    ]),
    onSelectSourceService(option: SourceService): void {
      this.setSourceService(option);
    },
    onEditSourceService(newValue: SourceService): void {
      this.editSourceService(newValue);
    },
    onCreateSourceService(): void {
      this.pushSourceServices({
        type: SourceType.ServerDB,
        label: 'custom',
        api: '',
        id: uuidv4(),
        isBuiltIn: false,
        isServerless: false,
      });
    },
    onSelectStorageService(option: StorageService): void {
      this.setStorageService(option);
    },
    onEditStorageService(newValue: StorageService): void {
      this.editStorageService(newValue);
    },
    onCreateStorageService(): void {
      this.pushStorageServices({
        type: StorageType.ServerDB,
        label: 'custom',
        api: '',
        id: uuidv4(),
        isBuiltIn: false,
        isServerless: false,
      });
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
