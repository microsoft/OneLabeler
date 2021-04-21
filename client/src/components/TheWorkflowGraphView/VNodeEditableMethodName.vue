<template>
  <v-card
    flat
    outlined
  >
    <v-card-title
      class="view-header px-2"
    >
      <template v-if="!isTitleEditable">
        <span class="subtitle-2" style="padding-bottom: 7.4px; padding-top: 7px">
          {{ title }}
        </span>
        <v-spacer />
      </template>
      <v-text-field
        v-else
        v-click-outside="onClickOutsideEditField"
        :value="title"
        :disabled="false"
        class="ma-0 py-1 subtitle-2"
        style="padding-bottom: 6px !important; letter-spacing: 0.01em !important;"
        type="text"
        dense
        hide-details
        single-line
        @input="onEditTitle($event)"
      />
      <v-btn
        v-if="!disabled"
        title="edit"
        x-small
        icon
        tile
        @click="onClickEditButton"
      >
        <v-icon
          aria-hidden="true"
          class="px-0"
          small
        >
          $vuetify.icons.values.edit
        </v-icon>
      </v-btn>
    </v-card-title>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VNodeEditableMethodName',
  props: {
    title: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isTitleEditable: false,
    };
  },
  methods: {
    onClickEditButton(): void {
      this.isTitleEditable = true;
    },
    onClickOutsideEditField(): void {
      this.isTitleEditable = false;
    },
    onEditTitle(title: string): void {
      this.$emit('edit:title', title);
    },
  },
});
</script>
