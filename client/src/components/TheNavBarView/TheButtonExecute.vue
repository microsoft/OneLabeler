<template>
  <v-btn
    v-if="shown"
    title="Submit (Ctrl + ->)"
    color="white"
    icon
    tile
    small
    :disabled="disabled"
    @click="onClickExecute"
  >
    <v-icon
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.start
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapGetters, mapState } from 'vuex';
import { MessageType } from '@/commons/types';

export default defineComponent({
  name: 'TheButtonExecute',
  data() {
    return {
      nDataObjects: 0,
    };
  },
  computed: {
    ...mapGetters('workflow', [
      'startNode',
      'nextNodes',
    ]),
    ...mapState('workflow', ['currentNode']),
    ...mapState([
      'dataObjects',
      'sourceService',
    ]),
    disabled(): boolean {
      return false;
      /*
      return (this.currentNode === null || this.nDataObjects === 0)
        && (this.sourceService.type !== SourceType.ServerDB);
      */
    },
    shown(): boolean {
      return true;
      /*
      return this.currentNode !== null
        || this.sourceService.type === SourceType.ServerDB;
      */
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
    ...mapActions(['setMessage']),
    ...mapActions('workflow', [
      'executeRegisterStorage',
      'executeWorkflow',
    ]),
    onKey(e: KeyboardEvent): void {
      const { ctrlKey, key } = e;
      // shortcut for next batch: Ctrl + ArrowRight
      if (!this.disabled && key === 'ArrowRight' && ctrlKey) {
        if (this.shown) {
          e.preventDefault();
          this.onClickExecute();
        }
      }
    },
    async onClickExecute(): Promise<void> {
      if (this.nextNodes === null) {
        await this.executeRegisterStorage();
        this.setMessage({
          content: 'Project Data Uploaded.',
          type: MessageType.Success,
        });
        await this.executeWorkflow({ node: this.startNode });
        return;
      }
      if (this.nextNodes.length !== 1) return;
      await this.executeWorkflow({ node: this.nextNodes[0] });
    },
  },
});
</script>
