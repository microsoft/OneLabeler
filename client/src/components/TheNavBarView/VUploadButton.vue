<template>
  <v-btn
    :title="title"
    :color="color"
    icon
    tile
    small
    @click="onClick"
  >
    <v-icon
      aria-hidden="true"
      :small="small"
    >
      $vuetify.icons.values.openFolder
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

enum UploadTarget {
  FILE = 'file',
  FOLDER = 'folder',
}
type ExtendedEvent = Event & { path: Array<{files: FileList}> }
type ExtendedHTMLInputElement = HTMLInputElement & { webkitdirectory: boolean }

export default Vue.extend({
  name: 'VUploadButton',
  props: {
    title: {
      default: 'Upload',
      type: String,
    },
    type: {
      default: 'file',
      type: String as PropType<UploadTarget>,
    },
    color: {
      default: 'black',
      type: String,
    },
    multiple: {
      default: false,
      type: Boolean,
    },
    small: {
      default: false,
      type: Boolean,
    },
    keyboardShortcut: {
      default: false,
      type: Boolean,
    },
  },
  created(): void {
    if (this.keyboardShortcut) {
      // enable label flipping by number key
      window.addEventListener('keydown', this.onKey);
    }
  },
  beforeDestroy(): void {
    if (this.keyboardShortcut) {
      // remove listener before distroy,
      // otherwise the onKey method will be called multiple times
      window.removeEventListener('keydown', this.onKey);
    }
  },
  methods: {
    onClick(): void {
      const input = document.createElement('input') as ExtendedHTMLInputElement;
      input.type = 'file';
      if (this.type === UploadTarget.FILE) {
        input.multiple = this.multiple;
      }
      if (this.type === UploadTarget.FOLDER) {
        input.webkitdirectory = true;
      }
      input.onchange = (e: Event) => {
        this.fileChanged(e as ExtendedEvent);
      };
      input.click();
    },
    onKey(e: KeyboardEvent): void {
      // shortcut for file load: ctrl + o
      const { ctrlKey, key } = e;
      if (key === 'o' && ctrlKey) {
        // override brower default ctrl + o function for loading file to the brower
        e.preventDefault();
        this.onClick();
      }
    },
    fileChanged(e: ExtendedEvent): void {
      if (e) {
        const target = e.target as HTMLInputElement;
        if (this.type === UploadTarget.FILE) {
          if (target.files && target.files[0]) {
            this.$emit('upload-file', target.files[0]);
          } else {
            this.$emit('upload-file', null);
          }
        }
        if (this.type === UploadTarget.FOLDER) {
          if (target.files) {
            this.$emit('upload-files', target.files);
          } else {
            this.$emit('upload-files', null);
          }
        }
      }
    },
  },
});
</script>
