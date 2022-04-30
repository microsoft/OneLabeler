<template>
  <!-- The undo label editing button. -->
  <v-btn
    :title="`Undo ${lastCommandName} (Ctrl + Z)`"
    color="white"
    icon
    tile
    small
    :disabled="disabled"
    @click="onClickUndo"
  >
    <v-icon
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.undo
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';
import type { ICommand } from '@/commons/types';
import EditBatchCommand from '@/commons/edit-batch-command';
import EditSingleCommand from '@/commons/edit-single-command';

export default defineComponent({
  name: 'TheButtonUndo',
  computed: {
    ...mapState(['commandHistory']),
    disabled(): boolean {
      return this.commandHistory.length === 0;
    },
    lastCommand(): ICommand | null {
      if (this.commandHistory.length === 0) {
        return null;
      }
      return this.commandHistory[this.commandHistory.length - 1];
    },
    lastCommandName(): string {
      const { lastCommand } = this;
      if (lastCommand === null) return '';
      if (lastCommand instanceof EditBatchCommand) return 'Edit Batch';
      if (lastCommand instanceof EditSingleCommand) return 'Edit Single';
      return '';
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
    ...mapActions(['popCommandHistory']),
    onKey(e: KeyboardEvent): void {
      const { ctrlKey, key } = e;
      // shortcut for undo: Ctrl + Z
      if (!this.disabled && key === 'z' && ctrlKey) {
        e.preventDefault();
        this.onClickUndo();
      }
    },
    onClickUndo(): void {
      if (this.lastCommand !== null) {
        this.lastCommand.undo();
        this.popCommandHistory();
      }
    },
  },
});
</script>
