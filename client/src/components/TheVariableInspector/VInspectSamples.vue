<template>
  <div>
    <div :style="style.cardHeader">
      <v-icon
        class="mx-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.samples
      </v-icon>
      Samples
    </div>
    <ObjectInspector
      :data="queryUuids"
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
import { cardHeader } from '@/style';

export default defineComponent({
  name: 'VInspectSamples',
  components: { ObjectInspector },
  props: {
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  data() {
    return { style: { cardHeader } };
  },
});
</script>
