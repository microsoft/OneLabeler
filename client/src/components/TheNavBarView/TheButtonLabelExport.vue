<template>
  <v-btn
    title="Export Labels"
    color="white"
    icon
    tile
    small
    :disabled="disableExportButton"
    @click="onClickExport"
  >
    <v-icon
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.export
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapGetters, mapState } from 'vuex';
import exportLabels from './export-labels';

export default defineComponent({
  name: 'TheButtonLabelExport',
  data() {
    return {
      nDataObjects: 0,
    };
  },
  computed: {
    ...mapGetters('workflow', ['dataType']),
    ...mapState([
      'dataObjects',
      'labels',
    ]),
    disableExportButton(): boolean {
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
  methods: {
    async onClickExport(): Promise<void> {
      await exportLabels(
        this.dataObjects,
        this.labels,
        this.dataType,
      );
    },
  },
});
</script>
