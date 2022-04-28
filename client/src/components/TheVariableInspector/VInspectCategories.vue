<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div>
    <div :style="style.cardHeader">
      <v-icon
        class="mx-2"
        aria-hidden="true"
        small
        width="18px"
      >
        $vuetify.icons.values.categories
      </v-icon>
      Categories
    </div>
    <VObjectInspector
      :data="categories"
      :array-max-properties="5"
      style="padding: 4px;"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import VObjectInspector from '@/../packages/object-inspector';
import type { Category } from '@/commons/types';
import { cardHeader } from '@/style';

export default defineComponent({
  name: 'VInspectCategories',
  components: { VObjectInspector },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
  },
  data() {
    return { style: { cardHeader } };
  },
});
</script>
