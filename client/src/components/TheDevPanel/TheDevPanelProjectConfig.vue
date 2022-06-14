<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="margin: 10px">
    <div style="display: flex; margin-bottom: 10px">
      <p style="height: 26px; margin-top: 3px">
        Choose source folder:
      </p>
      <v-btn
        title="Reset Settings"
        color="black"
        icon
        tile
        small
        @click="browseOnClick()"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.open
        </v-icon>
      </v-btn>
      <p style="height: 26px; margin-left: 5px; margin-top: 3px">
        {{ sourceFolder }}
      </p>
    </div>
    <div style="display: flex; height: 26px">
      <p style="height: 26px">
        Create classes:
      </p>

      <span style="margin-left: 10px">
        {{ `${categories.length} classes` }}
      </span>

      <!-- The create new class option button. -->
      <div style="background: grey; margin-left: 5px; padding-left: 7px">
        <TheClassesDialog
          :categories="categories"
          :category-tasks="categoryTasks"
          :label-tasks="labelTasks"
          :unlabeled-mark="unlabeledMark"
          :label2color="label2color"
          @add:category="addCategory($event)"
          @remove:category="removeCategory($event)"
          @set:category-tasks="setCategoryTasks($event)"
          @upsert:color-mapper="upsertColorMapper($event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapGetters, mapState } from 'vuex';
import { StatusType } from '@/commons/types';
import type { IDataObjectStorage, IStatusStorage } from '@/commons/types';
import TheClassesDialog from '../TheFooterView/TheClassesDialog.vue';

type ExtendedEvent = Event & { path: Array<{files: FileList}> }
type ExtendedHTMLInputElement = HTMLInputElement & { webkitdirectory: boolean }

export default defineComponent({
  name: 'TheDevPanelProjectConfig',
  components: { TheClassesDialog },
  data() {
    return {
      nTotal: 0,
      nLabeled: 0,
      sourceFolder: window.sourcePath,
    };
  },
  computed: {
    ...mapState([
      'dataObjects',
      'statuses',
      'categoryTasks',
      'unlabeledMark',
    ]),
    ...mapGetters(['categories', 'label2color']),
    ...mapGetters('workflow', ['labelTasks']),
  },
  watch: {
    async statuses(): Promise<void> {
      await this.setData();
    },
  },
  async mounted(): Promise<void> {
    await this.setData();
  },
  methods: {
    ...mapActions([
      'addCategory',
      'removeCategory',
      'setCategoryTasks',
      'upsertColorMapper',
    ]),
    async setData(): Promise<void> {
      this.nLabeled = await this.getNLabeled();
      this.nTotal = await this.getNTotal();
    },
    async getNLabeled(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.countByValue(StatusType.Labeled);
    },
    async getNTotal(): Promise<number> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      if (dataObjects === null) return 0;
      return dataObjects.count();
    },
    browseOnClick(): void {
      const input = document.createElement('input') as ExtendedHTMLInputElement;
      input.type = 'file';
      input.webkitdirectory = true;
      input.onchange = (e: Event) => {
        this.fileChanged(e as ExtendedEvent);
      };
      input.click();
    },
    fileChanged(e: ExtendedEvent): void {
      if (e) {
        const target = e.target as HTMLInputElement;
        if (target.files.length === 0) {
          // eslint-disable-next-line
          window.alert('No files found!');
        }

        this.sourceFolder = this.getDirectory(target.files[0].path);
        window.dataFiles = target.files;
        window.sourcePath = this.sourceFolder;
      }
    },
    getDirectory(path: string): string {
      if (!path) {
        return path;
      }

      let pos = path.lastIndexOf('\\');
      if (pos === -1) {
        pos = path.lastIndexOf('/');
      }

      if (pos === -1) {
        throw new Error(`invalid path - ${path}`);
      }

      return path.substring(0, pos);
    },
  },
});
</script>
