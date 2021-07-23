<template>
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
            class="title"
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

export default Vue.extend({
  name: 'VSingleTool',
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
      const { labelText } = this;
      if (labelText === null) return 'note';
      return `note: ${labelText.content}`;
    },
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
      this.dialog = false;
      this.syncLabel();
      this.$emit('set:label-text', text);
    },
    onClickCloseDialog(): void {
      this.dialog = false;
      this.syncLabel();
      this.$emit('click:close');
    },
    syncLabel(): void {
      if (this.labelText === null || this.labelText === undefined) {
        this.text = null;
      } else {
        this.text = this.labelText.content;
      }
    },
  },
});
</script>
