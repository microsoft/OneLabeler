<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

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
    <VObjectInspector
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
import VObjectInspector from '@/../packages/object-inspector';
import { cardHeader } from '@/style';

export default defineComponent({
  name: 'VInspectStop',
  components: { VObjectInspector },
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
