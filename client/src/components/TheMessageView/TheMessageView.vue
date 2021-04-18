<template>
  <v-snackbar
    v-if="message !== null"
    v-model="snackbar"
    content-class="py-0"
    :timeout="timeout"
    :color="{
      'Success': 'success',
      'Error': 'error'
    }[message.type]"
    text
    outlined
    @input="onUpdate"
  >
    <p class="subtitle-1 text-center my-0">
      {{ message.content }}
    </p>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';

export default Vue.extend({
  name: 'TheMessageView',
  data() {
    return {
      snackbar: false,
      timeout: 5000,
    };
  },
  computed: {
    ...mapState(['message']),
  },
  watch: {
    message() {
      if (this.message === null) return;
      this.snackbar = true;
    },
  },
  methods: {
    ...mapActions(['setMessage']),
    onUpdate(snackbar: boolean) {
      if (snackbar === false) {
        this.setMessage(null);
      }
    },
  },
});
</script>
