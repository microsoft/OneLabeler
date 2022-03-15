<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div :style="style.card">
    <div
      :style="style.cardHeader"
      class="px-2"
    >
      <template v-if="!editable">
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
        ref="textField"
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
        @click="editable = true"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { onClickOutside } from '@vueuse/core';
import { card, cardHeader } from '@/style';

export default defineComponent({
  name: 'VModuleLabel',
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
  setup() {
    const textField = ref(null);
    const editable = ref(false);
    onClickOutside(textField, () => { editable.value = false; });
    return { textField, editable };
  },
  data() {
    return { style: { card, cardHeader } };
  },
});
</script>
