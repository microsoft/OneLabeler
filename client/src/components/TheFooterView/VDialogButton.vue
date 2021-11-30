<template>
  <v-dialog
    v-model="dialog"
    persistent
    hide-overlay
    :max-width="maxWidth"
  >
    <template #activator="{ on }">
      <slot name="button">
        <v-btn
          :title="buttonTitle"
          :icon="buttonText === undefined"
          :text="buttonText !== undefined"
          class="mr-2"
          color="white"
          style="display: inline-flex; align-items: center; height: 100%;"
          x-small
          tile
          v-on="on"
        >
          <v-icon
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
            {{ dialogHeaderTitle }}
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

      <slot name="dialog-body" />
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'VDialogButton',
  props: {
    /** The icon in the button triggering dialog. */
    buttonIcon: {
      type: String as PropType<string>,
      default: undefined,
    },
    /** The text in the button triggering dialog. */
    buttonText: {
      type: String as PropType<string>,
      default: undefined,
    },
    /** The title of the button triggering dialog. */
    buttonTitle: {
      type: String as PropType<string>,
      default: undefined,
    },
    /** The title in the dialog header. */
    dialogHeaderTitle: {
      type: String as PropType<string>,
      default: undefined,
    },
    /** The maximum width for the component. */
    maxWidth: {
      type: String as PropType<string>,
      default: '600px',
    },
  },
  emits: {
    'click:close': null,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    onClickCloseDialog(): void {
      this.dialog = false;
      this.$emit('click:close');
    },
  },
});
</script>
