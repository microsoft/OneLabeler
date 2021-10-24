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
          class="view-header-button subtitle-2"
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
    <v-card
      class="px-6 py-4"
      style="border-radius: 2px"
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
        class="view-header-button subtitle-2"
        type="submit"
        @click="onSetLabelText"
      >
        submit
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ILabelText } from '@/commons/types';
import { ILabel } from '../../types';

export default Vue.extend({
  name: 'VSingleTool',
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
      this.$emit('upsert:label', partialLabel);
    },
    onClickCloseDialog(): void {
      this.dialog = false;
      this.syncLabel();
      this.$emit('click:close');
    },
    syncLabel(): void {
      const textContent = this.label?.text?.content ?? null;
      if (textContent !== null) {
        this.text = textContent;
        return;
      }
      const queries = this.label?.queries ?? [];
      if (queries.length !== 1) return;
      this.text = queries[0].text;
    },
  },
});
</script>
