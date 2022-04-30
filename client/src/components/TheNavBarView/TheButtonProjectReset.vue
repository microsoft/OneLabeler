<template>
  <v-btn
    title="Reset Dataset"
    color="white"
    icon
    tile
    small
    :disabled="disableResetButton"
    @click="resetState"
  >
    <v-icon
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.reset
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';

export default defineComponent({
  name: 'TheButtonProjectReset',
  data() {
    return {
      nDataObjects: 0,
    };
  },
  computed: {
    ...mapState(['dataObjects']),
    disableResetButton(): boolean {
      return this.nDataObjects === 0;
    },
  },
  watch: {
    async dataObjects() {
      const { dataObjects } = this;
      this.nDataObjects = dataObjects === null
        ? 0
        : await dataObjects.count();
    },
  },
  methods: {
    ...mapActions(['resetState']),
  },
});
</script>
