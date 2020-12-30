<template>
  <v-app id="app">
    <v-container
      class="pa-0"
      style="overflow-y: hidden"
      fill-height
      fluid
    >
      <v-row no-gutters>
        <NavBarView :height="navBarHeight" />
      </v-row>
      <v-row
        no-gutters
        :style="`height: calc(100% - ${navBarHeight}px);`"
      >
        <ImageView style="width: 100%;" />
      </v-row>
    </v-container>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import NavBarView from '@/components/TheNavBar.vue';
import ImageView from '@/components/TheImageView.vue';

@Component({
  name: 'App',
  components: {
    NavBarView,
    ImageView,
  },
})
export default class App extends Vue {
  data(): { navBarHeight: number } {
    return {
      navBarHeight: 40,
    };
  }
}
</script>
