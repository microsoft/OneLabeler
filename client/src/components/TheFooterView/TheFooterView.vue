<template>
  <v-toolbar
    dense
    class="app-footer"
    :height="height"
  >
    <v-toolbar-title class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${dataObjects.length} data objects` }}
    </v-toolbar-title>
    <v-divider
      class="app-footer-divider"
      vertical
    />
    <v-toolbar-title class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${dataObjects.length - unlabeledIndices.length} / ${dataObjects.length} labeled` }}
    </v-toolbar-title>
    <v-divider
      class="app-footer-divider"
      vertical
    />
    <v-toolbar-title class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${classes.length} classes` }}
    </v-toolbar-title>
    <v-divider
      class="app-footer-divider"
      vertical
    />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

export default Vue.extend({
  name: 'TheFooterView',
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  computed: {
    ...mapState(['dataObjects', 'classes']),
    ...mapGetters(['unlabeledIndices']),
  },
});
</script>
