<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <!-- The create/edit freeform text annotation button. -->
  <v-dialog
    v-model="dialog"
    persistent
    hide-overlay
    :max-width="maxWidth"
  >
    <template #activator="{ on }">
      <!-- The activation button. -->
      <slot name="button">
        <v-btn
          :title="buttonTitle"
          :disabled="disabled"
          class="card-header-button subtitle-2"
          x-small
          v-on="on"
        >
          <v-icon
            class="mr-1"
            aria-hidden="true"
            small
          >
            {{ buttonIcon }}
          </v-icon>
          {{ buttonText }}
        </v-btn>
      </slot>
    </template>
    <div
      class="px-6 py-4"
      style="background-color: white"
    >
      <div style="display: flex; flex-direction: row;">
        <slot name="dialog-header">
          <span
            class="subtitle-1"
            style="user-select: none"
          >
            {{ dialogTitle }}
          </span>

          <div style="flex-grow: 1" />

          <v-btn
            color="black"
            title="Close"
            icon
            tile
            small
            @click="onClickCloseDialog"
          >
            <v-icon
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.close
            </v-icon>
          </v-btn>
        </slot>
      </div>

      <v-textarea
        v-model="text"
        label="Annotation"
        no-resize
      />

      <v-btn
        x-small
        class="card-header-button subtitle-2"
        type="submit"
        @click="onSetLabelText"
      >
        submit
      </v-btn>
    </div>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import type { ILabel, ILabelText } from '@/commons/types';

export default defineComponent({
  name: 'BaseSingleTool',
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'upsert:labels': null,
    'click:close': null,
  },
  data() {
    return {
      maxWidth: '600px',
      buttonText: 'note',
      buttonIcon: this.$vuetify.icons.values.text,
      dialogTitle: 'Freeform Text Annotation',
      dialog: false,
      text: null as string | null,
    };
  },
  computed: {
    buttonTitle(): string {
      const { label } = this;
      if (label === null) return 'note';
      return `note: ${label?.text?.content}`;
    },
  },
  watch: {
    label() {
      this.syncLabel();
    },
  },
  mounted() {
    this.syncLabel();
  },
  methods: {
    onSetLabelText(): void {
      const text: ILabelText = { content: this.text };
      const partialLabel: Partial<ILabel> = { text };
      this.dialog = false;
      this.syncLabel();
      this.$emit('upsert:labels', partialLabel);
    },
    onClickCloseDialog(): void {
      this.dialog = false;
      this.syncLabel();
      this.$emit('click:close');
    },
    syncLabel(): void {
      this.text = this.label?.text?.content ?? null;
    },
  },
});
</script>
