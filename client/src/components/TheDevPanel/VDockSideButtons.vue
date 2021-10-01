<template>
  <div>
    <v-btn
      title="Undock into separate window"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.WINDOW)"
    >
      <Icon
        icon="mdi:dock-window"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Dock to left"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.LEFT)"
    >
      <Icon
        icon="mdi:dock-left"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Dock to bottom"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.BOTTOM)"
    >
      <Icon
        icon="mdi:dock-bottom"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Dock to right"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.RIGHT)"
    >
      <Icon
        icon="mdi:dock-right"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      class="mr-1"
      title="Close"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.HIDE)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.close
      </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon } from '@iconify/vue2';
import { DockSideType } from '@/commons/types';

export default Vue.extend({
  name: 'VDockSideButtons',
  components: { Icon },
  data() {
    return { DockSideType };
  },
});
</script>
