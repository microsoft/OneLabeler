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
          class="view-header-button"
          x-small
          :icon="buttonText === undefined"
          :text="buttonText !== undefined"
          v-on="on"
        >
          <v-icon
            aria-hidden="true"
            color="black"
            small
          >
            {{ buttonIcon }}
          </v-icon>
          {{ buttonText }}
        </v-btn>
      </slot>
    </template>
    <v-card style="border-radius: 2px">
      <v-card-title>
        <slot name="dialog-header">
          <span
            class="title"
            style="user-select: none"
          >
            {{ dialogHeaderTitle }}
          </span>
          <v-spacer />
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
      </v-card-title>
      <v-card-text>
        <slot name="dialog-body" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VDialogButton',
  props: {
    /**
     * @description The icon in the button triggering dialog.
     */
    buttonIcon: {
      type: String,
      default: undefined,
    },
    /**
     * @description The text in the button triggering dialog.
     */
    buttonText: {
      type: String,
      default: undefined,
    },
    /**
     * @description The title of the button triggering dialog.
     */
    buttonTitle: {
      type: String,
      default: undefined,
    },
    /**
     * @description The title in the dialog header.
     */
    dialogHeaderTitle: {
      type: String,
      default: undefined,
    },
    /**
     * @description The maximum width for the component.
     */
    maxWidth: {
      type: String,
      default: '600px',
    },
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    onClickCloseDialog(): void {
      this.dialog = false;
      this.$emit('click-close-dialog');
    },
  },
});
</script>
