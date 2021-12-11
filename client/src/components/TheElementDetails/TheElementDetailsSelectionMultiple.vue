<template>
  <div
    class="card-elevated"
    style="display: flex; flex-direction: column"
  >
    <div class="card-header">
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
  </div>
</template>

<script lang="ts">
export default {
  name: 'TheElementDetailsSelectionMultiple',
};
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
.card-elevated {
  @extend .elevation-2;
  @extend .card;
}
</style>
