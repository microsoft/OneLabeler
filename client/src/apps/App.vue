<template>
  <v-app>
    <div
      style="flex: 1 1 auto; display: flex;"
      :style="{
        'flex-direction': {
          [DockSideType.Bottom]: 'column',
          [DockSideType.Left]: 'row-reverse',
          [DockSideType.Right]: 'row',
        }[dockSide],
      }"
    >
      <TheDevPanel
        style="flex: 1 1 50%"
        :style="[DockSideType.FullScreen, DockSideType.Minimap].includes(dockSide)
          ? 'display: none' : null"
      />
      <template v-if="dockSide === DockSideType.Window">
        <v-dialog
          :value="true"
          persistent
          width="fit-content"
          content-class="rounded-0"
        >
          <ThePreviewPanel
            style="height: 80vh; width: 80vw;"
            @click:close="setDockSide(DockSideType.Hide)"
          />
        </v-dialog>
      </template>
      <template v-else-if="dockSide !== DockSideType.Hide">
        <v-divider
          v-if="dockSide !== DockSideType.FullScreen && dockSide !== DockSideType.Minimap"
          style="border-width: 2px;"
          :horizontal="dockSide === DockSideType.Bottom"
          :vertical="dockSide === DockSideType.Right || dockSide === DockSideType.Left"
        />
        <ThePreviewPanel
          style="flex: 1 1 50%"
          @click:close="setDockSide(DockSideType.Hide)"
        />
        <template v-if="dockSide === DockSideType.Minimap">
          <TheWorkflowMinimap
            style="position: absolute; pointer-events: none;
            width: 800px; height: 400px;
            transform: scale(0.5); transform-origin: 0% 0% 0px;
            margin-top: 80px;
            margin-left: 10px;
            opacity: 0.9"
          />
        </template>
      </template>
    </div>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import { mapActions, mapState } from 'vuex';
import { DockSideType } from '@/commons/types';
import TheDevPanel from '@/components/TheDevPanel/TheDevPanel.vue';
import TheWorkflowMinimap from '@/components/TheWorkflowMinimap/TheWorkflowMinimap.vue';
import ThePreviewPanel from '@/components/ThePreviewPanel/ThePreviewPanel.vue';

export default defineComponent({
  name: 'App',
  components: {
    TheDevPanel,
    ThePreviewPanel,
    TheWorkflowMinimap,
  },
  data() {
    return { DockSideType };
  },
  computed: {
    ...mapState(['dockSide']),
  },
  methods: {
    ...mapActions(['setDockSide']),
  },
});
</script>

<style lang="scss" scoped>
.windows-container {
  $margin: 4px;
  display: grid;
  flex: 1 1 auto;
  gap: $margin;
  margin: $margin;
}
</style>
