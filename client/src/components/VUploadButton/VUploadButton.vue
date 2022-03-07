<template>
  <v-btn
    :title="title"
    :color="color"
    :disabled="disabled"
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
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { UploadTarget } from '@/commons/types';

type ExtendedEvent = Event & { path: Array<{files: FileList}> }
type ExtendedHTMLInputElement = HTMLInputElement & { webkitdirectory: boolean }
type KeyboardTrigger = ((e: KeyboardEvent) => boolean) | null

export default defineComponent({
  name: 'VUploadButton',
  props: {
    title: {
      type: String,
      default: 'Upload',
    },
    type: {
      type: String as PropType<UploadTarget>,
      default: UploadTarget.File,
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
    disabled: {
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
  emits: {
    'upload:file': null,
    'upload:files': null,
  },
  created(): void {
    if (this.keyboardTrigger !== null) {
      // enable label flipping by number key
      window.addEventListener('keydown', this.onKey);
    }
  },
  beforeDestroy(): void {
    if (this.keyboardTrigger !== null) {
      // remove listener before destroy,
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
        // override browser default short cut
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
          this.$emit('upload:files', target.files);
        }
      }
    },
  },
});
</script>
