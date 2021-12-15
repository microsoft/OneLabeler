<template>
  <div
    class="subtitle-2"
    style="display: flex"
  >
    Node Label
    <template v-if="!editable">
      <span class="pl-4 subtitle-2">
        {{ label }}
      </span>
      <v-spacer />
    </template>
    <v-text-field
      v-else
      ref="textField"
      :value="label"
      :disabled="false"
      class="ma-0 pl-4 subtitle-2"
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
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { onClickOutside } from '@vueuse/core';

export default defineComponent({
  name: 'VNodeEditableLabel',
  props: {
    label: {
      type: String as PropType<string>,
      default: '',
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
});
</script>
