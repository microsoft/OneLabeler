<template>
  <v-card
    style="display: flex; flex-direction: column"
    tile
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      Module Setting
    </div>
    <v-divider />
    <div style="flex: 1 1 auto; display: flex; align-items: center">
      <p class="mx-auto subtitle-1">
        Multiple Elements Selected
      </p>
    </div>
  </v-card>
</template>

<script lang="ts">
export default {
  name: 'TheElementDetailsSelectionMultiple',
};
</script>
