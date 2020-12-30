<template>
  <v-toolbar
    dense
    class="elevation-1 grey darken-1"
    :height="height"
  >
    <v-toolbar-title
      class="grey--text text--lighten-2"
      style="font-size: large"
    >
      Vue Tornado Template
    </v-toolbar-title>
    <v-divider
      vertical
      style="margin-left: 5px; margin-right: 5px"
    />
    <UploadFileButton
      title="Open"
      small
      @upload-file="onUploadFile"
    />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions } from 'vuex';
import uploadImg from '@/services/upload-img';
import UploadFileButton from './VUploadFileButton.vue';

export default Vue.extend({
  name: 'TheNavBar',
  components: {
    UploadFileButton,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  methods: {
    ...mapActions(['setImgObj']),
    async onUploadFile(file: File): Promise<void> {
      if (file === null || file === undefined) return;
      const response = await uploadImg(file);
      const path = response.data.imgPath;
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        this.setImgObj({
          src: img.src,
          width: img.width,
          height: img.height,
          imgPath: path,
        });
      };
    },
  },
});
</script>
