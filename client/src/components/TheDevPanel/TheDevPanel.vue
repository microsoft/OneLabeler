<!-- Copyright (c) Microsoft Corporation.
     Licensed under the MIT License. -->

<template>
  <div style="background-color: white; display: flex; flex-direction: column;">
    <TheDevPanelHeader v-show="showToolbar"
      :show-element-settings.sync="showElementSettings"
      :show-inspector.sync="showInspector"
      @showGetStartedEvent="(arg) => this.showGetStartedHandler(arg)"
    />
    <div v-show="showToolbar" style="margin: 2px" />
    <div v-show="showToolbar" :class='{"tabs__light": true}'>
      <ul class='tabs__header'>
        <li :class='{"tab__selected": (this.curSelectedTab == 0)}' @click='this.workflowTabClicked'>Workflow</li>
        <li :class='{"tab__selected": (this.curSelectedTab == 1)}' @click='this.tabTabClicked'>Config</li>
      </ul>
    </div>
    <TheDevPanelProjectWorkflow v-show="this.curSelectedTab == 0"
      :showElementSettings="showElementSettings"
      :showInspector="showInspector"
      class="pa-1"
      style="flex: 1 1 auto; overflow: hidden;"
      @showGetStartedEvent="(arg) => this.showGetStartedHandler(arg)"
      :showGetStarted = showStartPage
    />
    <TheDevPanelProjectConfig v-show="this.curSelectedTab == 1"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import TheDevPanelProjectWorkflow from './TheDevPanelProjectWorkflow.vue';
import TheDevPanelProjectConfig from './TheDevPanelProjectConfig.vue';
import TheDevPanelHeader from './TheDevPanelHeader.vue';

export default defineComponent({
  name: 'TheDevPanel',
  components: {
    TheDevPanelHeader,
    TheDevPanelProjectWorkflow,
    TheDevPanelProjectConfig,
  },
  data() {
    return {
      showElementSettings: true,
      showInspector: true,
      showToolbar: false,
      showStartPage: true,
      curSelectedTab: 0,
    };
  },
  methods: {
    showGetStartedHandler(show: boolean): void {
      this.showStartPage = show;
      this.showToolbar = !show;
      this.curSelectedTab = 0;
    },
    workflowTabClicked(): void {
      if (this.curSelectedTab != 0) {
        this.curSelectedTab = 0;
      }
    },
    tabTabClicked(): void {
      if (this.curSelectedTab != 1) {
        this.curSelectedTab = 1;
      }
    },
  },
});
</script>

<style lang="css">
  ul.tabs__header {
    display: block;
    list-style: none;
    margin: 0 0 0 10px;
    padding: 0;
  }
  ul.tabs__header > li {
    padding: 15px 30px;
    border-radius: 10px;
    margin: 0;
    display: inline-block;
    margin-right: 5px;
    cursor: pointer;
  }
  ul.tabs__header > li.tab__selected {
    font-weight: bold;
    border-radius: 10px 10px 0 0;
    border-bottom: 8px solid transparent;
  }
  .tabs__light .tab{
    background-color: #fff;
  }
  .tabs__light li {
    background-color: #ddd;
    color: #aaa;
  }
  .tabs__light li.tab__selected {
    background-color: #fff;
    color: #000000;
  }
  .tabs__dark .tab{
    background-color: #555;
    color: #eee;
  }
  .tabs__dark li {
    background-color: #ddd;
    color: #aaa;
  }
  .tabs__dark li.tab__selected {
    background-color: #555;
    color: white;
  }
</style>