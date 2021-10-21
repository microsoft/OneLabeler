<template>
  <div style="display: flex; flex: 1 1 100%; align-items: center;">
    Node Label
    <template v-if="!isLabelEditable">
      <span class="pl-4 subtitle-2">
        {{ label }}
      </span>
      <v-spacer />
    </template>
    <v-text-field
      v-else
      v-click-outside="onClickOutsideEditField"
      :value="label"
      :disabled="false"
      class="ma-0 pl-4 pt-1 subtitle-2"
      style="padding-bottom: 6px !important; letter-spacing: 0.01em !important;"
      type="text"
      dense
      hide-details
      single-line
      @input="$emit('edit:label', $event)"
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
  name: 'VNodeEditableLabel',
  props: {
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isLabelEditable: false,
    };
  },
  methods: {
    onClickEditButton(): void {
      this.isLabelEditable = true;
    },
    onClickOutsideEditField(): void {
      this.isLabelEditable = false;
    },
  },
});
</script>
