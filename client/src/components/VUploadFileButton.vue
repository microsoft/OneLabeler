<template>
  <v-btn
    :title="title"
    color="white"
    icon
    tile
    small
    @click="onClick"
  >
    <v-icon
      aria-hidden="true"
      :small="small"
    >
      $vuetify.icons.values.openFile
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'UploadButtom',
  props: {
    multiple: {
      default: false,
      type: Boolean,
    },
    small: {
      default: false,
      type: Boolean,
    },
    title: {
      default: 'Upload',
      type: String,
    },
  },
  created(): void {
    // enable label flipping by number key
    window.addEventListener('keydown', this.onKey);
  },
  beforeDestroy(): void {
    // remove listener before distroy, otherwise the onKey method will be called multiple times
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    onClick(): void {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.onchange = (e) => {
        this.fileChanged(e);
      };
      input.click();
    },
    onKey(e: KeyboardEvent): void {
      // shortcut for file load: ctrl+O
      const { ctrlKey, key } = e;
      if (key === 'o' && ctrlKey) {
        // override brower default ctrl+O function for loading file to the brower
        e.preventDefault();
        this.onClick();
      }
    },
    fileChanged(e: Event): void {
      if (e) {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          if (target.files[0]) {
            this.$emit('upload-file', target.files[0]);
          } else {
            this.$emit('upload-file', null);
          }
        } else {
          this.$emit('upload-file', null);
        }
      }
    },
  },
});
</script>
