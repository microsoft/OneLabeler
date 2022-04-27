<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <BaseSelectionView
    :task-window="taskWindow"
    :data-objects="dataObjects"
    :labels="labels"
    :query-uuids="queryUuids"
    :scope-uuids="scopeUuids"
    :unlabeled-mark="unlabeledMark"
    :feature-names="featureNames"
    :label2color="label2color"
    @set:query-uuids="onSetQueryUuids"
    @update:task-window="updateTaskWindow({ ...taskWindow, ...$event })"
  />
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { mapActions, mapGetters, mapState } from 'vuex';
import type { TaskWindow } from '@/commons/types';
import BaseSelectionView from './BaseSelectionView.vue';

export default defineComponent({
  name: 'TheSelectionView',
  components: { BaseSelectionView },
  props: {
    taskWindow: {
      type: Object as PropType<TaskWindow>,
      required: true,
    },
  },
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'queryUuids',
      'scopeUuids',
      'unlabeledMark',
      'featureNames',
    ]),
    ...mapGetters(['label2color']),
    ...mapGetters('workflow', ['nextNodes']),
  },
  methods: {
    ...mapActions(['updateTaskWindow']),
    ...mapActions('workflow', [
      'executeDataObjectSelectionManual',
      'executeWorkflow',
    ]),
    async onSetQueryUuids(uuids: string[]): Promise<void> {
      if (uuids.length === 0) return;
      const { taskWindow } = this;
      await this.executeDataObjectSelectionManual(uuids);
      if (this.nextNodes === null || this.nextNodes.length !== 1) return;

      // await this.executeWorkflow({ node: this.nextNodes[0] });
      await this.executeWorkflow({ node: taskWindow.node });
    },
  },
});
</script>
