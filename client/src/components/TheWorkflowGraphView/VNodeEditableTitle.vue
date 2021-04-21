<template>
  <div style="display: flex; flex: 1 1 100%; align-items: center;">
    Node Name
    <template v-if="!isTitleEditable">
      <span class="pl-4 subtitle-2">
        {{ title }}
      </span>
      <v-spacer />
    </template>
    <v-text-field
      v-else
      v-click-outside="onClickOutsideEditField"
      :value="title"
      :disabled="false"
      class="ma-0 pl-4 pt-1 subtitle-2"
      style="padding-bottom: 6px !important; letter-spacing: 0.01em !important;"
      type="text"
      dense
      hide-details
      single-line
      @input="onEditTitle($event)"
    />
    <v-btn
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'VNodeEditableTitle',
  props: {
    title: {
      type: String,
      default: '',
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
