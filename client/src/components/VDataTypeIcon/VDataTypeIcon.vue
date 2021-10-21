<template>
  <v-icon
    class="px-2"
    aria-hidden="true"
    small
  >
    {{
      {
        [DataType.Audio]: $vuetify.icons.values.fileAudio,
        [DataType.Video]: $vuetify.icons.values.fileVideo,
        [DataType.Text]: $vuetify.icons.values.fileText,
        [DataType.Image]: $vuetify.icons.values.fileImage,
      }[dataType] || $vuetify.icons.values.file
    }}
  </v-icon>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { DataType } from '@/commons/types';

export default Vue.extend({
  name: 'VDataTypeIcon',
  props: {
    dataType: {
      type: String as PropType<DataType>,
      // In case the interface is created before data type is selected.
      default: null,
    },
  },
  data() {
    return { DataType };
  },
});
</script>
