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
      {{ icon }}
    </v-icon>
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

enum UploadTarget {
  File = 'file',
  Folder = 'folder',
}
type ExtendedEvent = Event & { path: Array<{files: FileList}> }
type ExtendedHTMLInputElement = HTMLInputElement & { webkitdirectory: boolean }
type KeyboardTrigger = ((e: KeyboardEvent) => boolean) | null

export default Vue.extend({
  name: 'VUploadButton',
  props: {
    title: {
      type: String,
      default: 'Upload',
    },
    type: {
      type: String as PropType<UploadTarget>,
      default: 'file',
    },
    color: {
      type: String,
      default: 'black',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '+',
    },
    keyboardTrigger: {
      type: Function as PropType<KeyboardTrigger | null>,
      default: null,
    },
  },
  created(): void {
    if (this.keyboardTrigger !== null) {
      // enable label flipping by number key
      window.addEventListener('keydown', this.onKey);
    }
  },
  beforeDestroy(): void {
    if (this.keyboardTrigger !== null) {
      // remove listener before distroy,
      // otherwise the onKey method will be called multiple times
      window.removeEventListener('keydown', this.onKey);
    }
  },
  methods: {
    onClick(): void {
      const input = document.createElement('input') as ExtendedHTMLInputElement;
      input.type = 'file';
      if (this.type === UploadTarget.File) {
        input.multiple = this.multiple;
      }
      if (this.type === UploadTarget.Folder) {
        input.webkitdirectory = true;
      }
      input.onchange = (e: Event) => {
        this.fileChanged(e as ExtendedEvent);
      };
      input.click();
    },
    onKey(e: KeyboardEvent): void {
      // shortcut for file load
      const { keyboardTrigger } = this;
      if (keyboardTrigger === null) return;
      if (keyboardTrigger(e)) {
        // override brower default short cut
        e.preventDefault();
        this.onClick();
      }
    },
    fileChanged(e: ExtendedEvent): void {
      if (e) {
        const target = e.target as HTMLInputElement;
        if (this.type === UploadTarget.File) {
          if (target.files && target.files[0]) {
            this.$emit('upload:file', target.files[0]);
          } else {
            this.$emit('upload:file', null);
          }
        }
        if (this.type === UploadTarget.Folder) {
          if (target.files) {
            this.$emit('upload:files', target.files);
          } else {
            this.$emit('upload:files', null);
          }
        }
      }
    },
  },
});
</script>
