<template>
  <div>
    <div :style="style.cardHeader">
      <v-icon
        class="mx-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.stoppage
      </v-icon>
      Stop
    </div>
    <ObjectInspector
      :data="stop"
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
  name: 'VInspectStop',
  components: { ObjectInspector },
  props: {
    stop: {
      type: Boolean as PropType<boolean>,
      required: true,
    },
  },
  data() {
    return { style: { cardHeader } };
  },
});
</script>
