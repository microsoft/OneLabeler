<template>
  <v-menu offset-y>
    <template #activator="{ on }">
      <v-btn
        :color="buttonColor === null ? '' : buttonColor"
        :disabled="disabled"
        class="view-header-button subtitle-2"
        x-small
        v-on="on"
      >
        {{ labelCategory }}
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="(category, i) in classes"
        :key="i"
        class="subtitle-2 px-4"
        style="min-height: 30px"
        @click="onSetLabelCategory(category)"
      >
        {{ category }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import {
  Category,
  ILabelCategory,
} from '@/commons/types';

export default Vue.extend({
  name: 'VSingleTool',
  props: {
    labelCategory: {
      type: String as PropType<ILabelCategory | null>,
      default: null,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    buttonColor: {
      type: String as PropType<string | null>,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onSetLabelCategory(category: Category): void {
      this.$emit('set:label-category', category);
    },
  },
});
</script>
