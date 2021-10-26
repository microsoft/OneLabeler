<template>
  <v-card
    :class="classNameOfPanel"
    tile
  >
    <div class="view-header">
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
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import {
  SourceType,
  StorageType,
} from '@/commons/types';
import VEditableService from './VEditableService.vue';

export default Vue.extend({
  name: 'TheDataManagementView',
  components: { VEditableService },
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
});
</script>

<style>
/** Make the letter spacing of v-text-field the same as text outside. */
.parameter-panel input {
  letter-spacing: .0071428571em;
}
</style>
