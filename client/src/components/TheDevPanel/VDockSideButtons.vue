<template>
  <div>
    <v-btn
      title="Undock into separate window"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Window)"
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
      @click="$emit('set:dock-side', DockSideType.Left)"
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
      @click="$emit('set:dock-side', DockSideType.Bottom)"
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
      @click="$emit('set:dock-side', DockSideType.Right)"
    >
      <Icon
        icon="mdi:dock-right"
        style="font-size: 16px"
      />
    </v-btn>

    <v-btn
      title="Full Screen"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.FullScreen)"
    >
      <v-icon
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.fullScreen
      </v-icon>
    </v-btn>

    <v-btn
      title="Close"
      color="white"
      icon
      tile
      small
      @click="$emit('set:dock-side', DockSideType.Hide)"
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
import { Icon } from '@iconify/vue2';
import { DockSideType } from '@/commons/types';

export default {
  name: 'VDockSideButtons',
  components: { Icon },
  data() {
    return { DockSideType };
  },
};
</script>
