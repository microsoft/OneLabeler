<template>
  <div>
    <div :style="style.cardHeader">
      <v-icon
        class="mx-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.model
      </v-icon>
      Model
    </div>
    <ObjectInspector
      :data="models"
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
import type { ModelService } from '@/commons/types';
import { cardHeader } from '@/style';

export default defineComponent({
  name: 'VInspectModel',
  components: { ObjectInspector },
  props: {
    models: {
      type: Array as PropType<ModelService[]>,
      required: true,
    },
  },
  data() {
    return { style: { cardHeader } };
  },
});
</script>
