<template>
  <v-dialog
    v-model="dialog"
    persistent
    hide-overlay
    width="fit-content"
    content-class="rounded-0 elevation-4"
    @click:outside="dialog = false"
  >
    <template #activator="{ on }">
      <BaseButton
        title="Create New Labeling Workflow"
        style="font-size: 1.5rem; color: #3794ff;"
        v-on="on"
      >
        <BaseIcon
          :class="$vuetify.icons.values.new"
          style="margin-right: 8px;"
        />
        New Labeling Project
      </BaseButton>
    </template>
    <div
      :style="style.cardElevated"
      style="display: flex; flex-direction: column; overflow-wrap: break-word; min-width: 0;"
    >
      <div :style="style.cardHeader">
        <div class="px-2">
          Create New...
        </div>
      </div>
      <v-divider />
      <VTemplateList @set:workflow="onSetWorkflow" />
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex';
import { defineComponent } from '@vue/composition-api';
import { cardElevated, cardHeader } from '@/style';
import type { WorkflowGraph } from '@/commons/types';
import BaseButton from '@/components/BaseButton/BaseButton.vue';
import BaseIcon from '@/components/BaseIcon/BaseIcon.vue';
import VTemplateList from '@/components/TheDevPanel/VTemplateList.vue';
import { ProjectContext } from '../TheNavBarView/load-project';

export default defineComponent({
  name: 'TheButtonWorkflowNew',
  components: {
    BaseButton,
    BaseIcon,
    VTemplateList,
  },
  emits: { 'set:workflow': null },
  data() {
    return {
      dialog: false,
      style: { cardElevated, cardHeader },
    };
  },
  computed: {
    ...mapState('workflow', ['nodes', 'edges']),
    workflow(): WorkflowGraph {
      const { nodes, edges } = this;
      return { nodes, edges };
    },
  },
  methods: {
    ...mapActions('workflow', ['setGraph']),
    ...mapActions(['resetState']),

    onSetWorkflow(workflow: WorkflowGraph): void {
      this.resetState();
      window.projectContext = {
        projectDef: null,
        projectFile: null,
        dataFiles: null,
      };

      this.setGraph(workflow);
      this.dialog = false;
      this.$emit('set:workflow');
      this.$emit('update:showStartPage', false);
    },
  },
});
</script>
