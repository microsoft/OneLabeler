<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div>
    <!-- <v-btn
      title="Undock into separate window"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Window)"
    >
      <Icon
        icon="mdi:dock-window"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Dock to left"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Left)"
    >
      <Icon
        icon="mdi:dock-left"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Dock to bottom"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Bottom)"
    >
      <Icon
        icon="mdi:dock-bottom"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Dock to right"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Right)"
    >
      <Icon
        icon="mdi:dock-right"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Full Screen"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.FullScreen)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.fullScreen
      </v-icon>
    </v-btn>

    <v-btn
      title="Dock to Minimap"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Minimap)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.minimap
      </v-icon>
    </v-btn> -->

    <v-btn
      title="Close"
      color="white"
      icon
      tile
      small
      @click="onClose"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapGetters, mapState, mapActions } from 'vuex';
import { DockSideType } from '@/commons/types';
import { saveJsonFileSync } from '@/plugins/file';
import type { WorkflowGraph } from '@/commons/types';
import { ProjectDefinition, ProjectData } from '../TheNavBarView/load-project';

export default defineComponent({
  name: 'VDockSideButtons',
  emits: {
    'set:dock-side': null,
  },
  data() {
    return { DockSideType };
  },
  computed: {
    ...mapGetters(['categories']),
    ...mapState([
      'dataObjects',
      'labels',
      'statuses',
      'categoryTasks',
      'unlabeledMark',
      'featureNames',
    ]),

    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  methods: {
    ...mapActions('workflow', ['resetGraph']),
    async onClose() {
      const pathSpecified = !!window.projectContext.projectFile;
      const file = pathSpecified ? window.projectContext.projectFile : 'project.json';
      const filePath = await this.saveProject(file as string, pathSpecified);

      if (filePath) {
        if (!pathSpecified) {
          window.projectContext.projectFile = filePath;
        }
      }

      this.$emit('set:dock-side', DockSideType.Hide);
    },
    async saveProject(file: string, overwrite = true): Promise<string | null | undefined> {
      const {
        dataObjects,
        categories,
        categoryTasks,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      const dataObjs = dataObjects ? await dataObjects.getAll() : [];
      const labelList = labels ? await labels.getAll() : [];
      const statusList = statuses ? await statuses.getAll() : [];
      const prjData: ProjectData = {
        dataObjects: dataObjs,
        categories,
        categoryTasks,
        labels: labelList,
        statuses: statusList,
        unlabeledMark,
        featureNames: featureNames.length === 0
          ? undefined : featureNames,
      };

      const projectDef: ProjectDefinition = {
        sourcePath: window.projectContext.sourcePath,
        projectData: prjData,
        workflow: this.workflow,
      };
      return saveJsonFileSync(projectDef, file, overwrite);
    },
  },
});
</script>
