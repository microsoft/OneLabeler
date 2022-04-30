<template>
  <BaseButton
    href="https://microsoft.github.io/OneLabeler-doc/"
    target="_blank"
    rel="noopener noreferrer"
    title="Open Documentation Website Link"
    style="font-size: 1.5rem; color: #3794ff;"
  >
    <BaseIcon
      :class="$vuetify.icons.values.documentation"
      style="margin-right: 8px;"
    />
    Documentation Website
  </BaseButton>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import BaseButton from '@/components/BaseButton/BaseButton.vue';
import BaseIcon from '@/components/BaseIcon/BaseIcon.vue';

export default defineComponent({
  name: 'TheButtonDocumentation',
  components: {
    BaseButton,
    BaseIcon,
  },
});
</script>
