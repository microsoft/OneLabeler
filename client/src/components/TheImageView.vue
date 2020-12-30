<template>
  <v-card>
    <v-card-title
      class="px-0 py-1 grey lighten-4 grey--text text--darken-1"
      style="font-size: large"
    >
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.image
      </v-icon>
      Image
    </v-card-title>
    <v-divider />
    <v-card-actions
      class="pa-0"
      style="height: calc(100% - 30px)"
    >
      <TheCanvas
        :svg-id="svgId"
      />
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import TheCanvas from './TheCanvas.vue';

export default Vue.extend({
  name: 'ImageOverview',
  components: { TheCanvas },
  data() {
    return {
      svgId: 'image-svg',
    };
  },
});
</script>
