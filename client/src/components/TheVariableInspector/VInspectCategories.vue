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
    <ObjectInspector
      :data="categories"
      :array-max-properties="5"
      theme="chromeLight"
      style="padding: 4px;"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import ObjectInspector from 'vue-object-inspector';
import type { Category } from '@/commons/types';
import { cardHeader } from '@/style';

export default defineComponent({
  name: 'VInspectCategories',
  components: { ObjectInspector },
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
