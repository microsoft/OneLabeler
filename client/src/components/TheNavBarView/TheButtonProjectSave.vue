<template>
  <v-btn
    title="Save Project (Ctrl + S)"
    color="white"
    icon
    tile
    small
    :disabled="disabled"
    @click="onClickSave"
  >
    <v-icon
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.save
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapGetters, mapState, mapActions } from 'vuex';
import type { WorkflowGraph } from '@/commons/types';
import { saveJsonFileSync } from '@/plugins/file';
import { ProjectDefinition, ProjectData } from './load-project';

export default defineComponent({
  name: 'TheButtonProjectSave',
  data() {
    return {
      nDataObjects: 0,
    };
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
    disabled(): boolean {
      return this.nDataObjects === 0;
    },

    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  watch: {
    async dataObjects() {
      const { dataObjects } = this;
      this.nDataObjects = dataObjects === null
        ? 0
        : await dataObjects.count();
    },
  },
  created(): void {
    // Bind keyboard events.
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // Remove listener before destroy,
    // otherwise the onKey method will be called multiple times.
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    ...mapActions('workflow', ['resetGraph']),
    onKey(e: KeyboardEvent): void {
      const { ctrlKey, key } = e;
      // shortcut for save: Ctrl + S
      if (!this.disabled && key === 's' && ctrlKey) {
        e.preventDefault();
        this.onClickSave();
      }
    },
    async onClickSave(): Promise<void> {
      const pathSpecified = !!window.projectContext.projectFile;
      const file = pathSpecified ? window.projectContext.projectFile : 'project.json';
      const filePath = await this.saveProject(file as string, pathSpecified);

      if (filePath) {
        if (!pathSpecified) {
          window.projectContext.projectFile = filePath;
        }
      }
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
