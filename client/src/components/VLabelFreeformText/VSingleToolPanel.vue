<template>
  <v-card style="display: flex; flex-direction: column; overflow-y: scroll;">
    <div style="display: flex; flex-direction: row;">
      <slot name="dialog-header">
        <span
          class="subtitle-1"
          style="user-select: none"
        >
          {{ dialogTitle }}
        </span>
      </slot>
    </div>

    <v-textarea
      v-model="text"
      label="Annotation"
      auto-grow
      no-resize
    />

    <v-btn
      x-small
      class="view-header-button subtitle-2"
      type="submit"
      @click="onSetLabelText"
    >
      submit
    </v-btn>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ILabelText } from '@/commons/types';

export default Vue.extend({
  name: 'VSingleToolPanel',
  props: {
    labelText: {
      type: Object as PropType<ILabelText | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogTitle: 'Freeform Text Annotation',
      text: null as string | null,
    };
  },
  watch: {
    labelText() {
      this.syncLabel();
    },
  },
  mounted() {
    this.syncLabel();
  },
  methods: {
    onSetLabelText(): void {
      const text: ILabelText = { content: this.text };
      this.syncLabel();
      this.$emit('set:label-text', text);
    },
    syncLabel(): void {
      this.text = this.labelText?.content ?? null;
    },
  },
});
</script>
