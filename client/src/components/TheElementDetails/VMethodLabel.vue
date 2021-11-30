<template>
  <v-card
    flat
    outlined
  >
    <v-card-title class="view-header px-2">
      <template v-if="!isLabelEditable">
        <span
          class="subtitle-2"
          style="padding-bottom: 7.4px; padding-top: 7px"
        >
          {{ label }}
        </span>
        <v-spacer />
      </template>
      <v-text-field
        v-else
        v-click-outside="onClickOutsideEditField"
        :value="label"
        :disabled="false"
        class="ma-0 py-1 subtitle-2"
        style="padding-bottom: 6px !important; letter-spacing: 0.01em !important;"
        type="text"
        dense
        hide-details
        single-line
        @input="$emit('edit:label', $event)"
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
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

export default defineComponent({
  name: 'VMethodLabel',
  props: {
    label: {
      type: String as PropType<string>,
      default: '',
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  emits: {
    'edit:label': null,
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
