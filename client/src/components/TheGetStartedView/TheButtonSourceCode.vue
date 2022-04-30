<template>
  <BaseButton
    href="https://github.com/microsoft/OneLabeler"
    target="_blank"
    rel="noopener noreferrer"
    title="Open Source Code Link"
    style="font-size: 1.5rem; color: #3794ff;"
  >
    <BaseIcon
      class="fa-fw"
      :class="$vuetify.icons.values.github"
      style="margin-right: 8px;"
    />
    Source Code
  </BaseButton>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import BaseButton from '@/components/BaseButton/BaseButton.vue';
import BaseIcon from '@/components/BaseIcon/BaseIcon.vue';

export default defineComponent({
  name: 'TheButtonSourceCode',
  components: {
    BaseButton,
    BaseIcon,
  },
});
</script>
