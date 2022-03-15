<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div :style="style.cardElevated">
    <div :style="style.cardHeader">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      Data Management
    </div>
    <v-divider />
    <div
      style="display: flex; flex-direction: column; gap: 4px; padding: 4px;"
    >
      <!-- The method used to instantiated the process. -->
      <VEditableService
        :label="'Source'"
        :service="sourceService"
        :options="sourceServices"
        :disabled="disabled"
        @select:service="setSourceService($event)"
        @edit:service="editSourceService($event)"
        @create:service="onCreateSourceService"
      />
      <VEditableService
        :label="'Storage'"
        :service="storageService"
        :options="storageServices"
        :disabled="disabled"
        @select:service="setStorageService($event)"
        @edit:service="editStorageService($event)"
        @create:service="onCreateStorageService"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import {
  SourceType,
  StorageType,
} from '@/commons/types';
import { cardElevated, cardHeader } from '@/style';
import VEditableService from './VEditableService.vue';

export default {
  name: 'TheDataManagementView',
  components: { VEditableService },
  data() {
    return { style: { cardElevated, cardHeader } };
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
};
</script>
