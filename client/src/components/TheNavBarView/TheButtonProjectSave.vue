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
import { mapGetters, mapState } from 'vuex';
import { saveJsonFile } from '@/plugins/file';
import { ProjectData } from './load-project';

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
    onKey(e: KeyboardEvent): void {
      const { ctrlKey, key } = e;
      // shortcut for save: Ctrl + S
      if (!this.disabled && key === 's' && ctrlKey) {
        e.preventDefault();
        this.onClickSave();
      }
    },
    async onClickSave(): Promise<void> {
      const {
        dataObjects,
        categories,
        categoryTasks,
        labels,
        statuses,
        unlabeledMark,
        featureNames,
      } = this;
      const projectData: ProjectData = {
        dataObjects: await dataObjects.getAll(),
        categories,
        categoryTasks,
        labels: await labels.getAll(),
        statuses: await statuses.getAll(),
        unlabeledMark,
        featureNames: featureNames.length === 0
          ? undefined : featureNames,
      };
      saveJsonFile(projectData, 'project.json');
    },
  },
});
</script>
