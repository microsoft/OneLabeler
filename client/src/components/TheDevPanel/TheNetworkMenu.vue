<template>
  <v-menu
    v-model="show"
    :close-on-content-click="false"
    offset-y
    left
  >
    <template #activator="{ on }">
      <v-btn
        title="Network connection"
        color="white"
        icon
        tile
        small
        v-on="on"
      >
        <v-icon
          aria-hidden="true"
          small
        >
          $vuetify.icons.values.network
        </v-icon>
      </v-btn>
    </template>
    <div style="background-color: white; overflow: hidden">
      <div class="table-row">
        <div class="table-cell">
          <v-icon
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.server
          </v-icon>
        </div>
        <div class="table-cell">
          Algorithm
        </div>
        <div class="table-cell">
          Server
        </div>
        <div class="table-cell">
          {{ algorithmServerLatency }}
        </div>
        <div class="table-cell">
          ms
        </div>
      </div>
      <div class="table-row">
        <div class="table-cell">
          <v-icon
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.data
          </v-icon>
        </div>
        <div class="table-cell">
          Database
        </div>
        <div class="table-cell">
          Server
        </div>
        <div class="table-cell">
          {{ databaseServerLatency }}
        </div>
        <div class="table-cell">
          ms
        </div>
      </div>
      <div class="table-row">
        <div class="table-cell">
          <v-icon
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.python
          </v-icon>
        </div>
        <div class="table-cell">
          Python API
        </div>
        <div class="table-cell">
          Server
        </div>
        <div class="table-cell">
          {{ pythonApiServerLatency }}
        </div>
        <div class="table-cell">
          ms
        </div>
        <div>
          <v-switch
            class="pa-0 pl-2 ma-0"
            :value="true"
            :ripple="false"
            hide-details
            dense
            @change="onTogglePythonApiServer($event)"
          />
        </div>
      </div>
    </div>
  </v-menu>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from '@vue/composition-api';
import {
  getAlgorithmServerLatency,
  getDatabaseServerLatency,
  getPythonApiServerLatency,
} from '@/services/ping-api';
import socket from '@/services/jupyter-api-plugin';

export default defineComponent({
  name: 'TheNetworkMenu',
  setup() {
    const show = ref(false);
    const algorithmServerLatency = ref(Infinity);
    const databaseServerLatency = ref(Infinity);
    const pythonApiServerLatency = ref(Infinity);
    let interval: ReturnType<typeof setInterval> | null = null;

    const updateInterval = () => {
      if (show.value === false && interval !== null) {
        clearInterval(interval);
        interval = null;
      } else if (show.value === true && interval === null) {
        interval = setInterval(async () => {
          algorithmServerLatency.value = await getAlgorithmServerLatency();
          databaseServerLatency.value = await getDatabaseServerLatency();
          pythonApiServerLatency.value = await getPythonApiServerLatency();
        }, 1000);
      }
    };

    watch(show, updateInterval);
    onMounted(updateInterval);
    onUnmounted(() => {
      if (interval !== null) clearInterval(interval);
    });

    return {
      show,
      algorithmServerLatency,
      databaseServerLatency,
      pythonApiServerLatency,
    };
  },
  methods: {
    onTogglePythonApiServer(enabled: (true | null)) {
      if (enabled) {
        socket.connect();
      } else {
        socket.close();
      }
    },
  },
});
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';

.table-row {
  @extend .py-1;
  display: table-row;
}
.table-cell {
  @extend .subtitle-2;
  @extend .px-1;
  display: table-cell;
  line-height: 30px !important;
}
</style>
