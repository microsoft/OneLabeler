<template>
  <!--
  <VMenusFlat
    style="height: 100%"
    :title="selectedNode.title + ' '
    + (selectedNode.type === 'process' ? 'Instantiation' : 'Choice')"
    :menus-config="selectedNode.config"
    :selected-options="settings"
    @click-menu-option="onClickMenuOption"
  />
  -->
  <v-card tile>
    <v-card-title
      class="view-header"
    >
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.parameter
      </v-icon>
      {{ title }}
    </v-card-title>
    <v-divider />
    <v-card-actions>
      <v-list
        dense
        subheader
        style="width: 100%"
      >
        
      </v-list>
      <!--
      <v-list
        dense
        subheader
        style="width: 100%"
      >
        <v-list-item
          v-for="(entry, key) in menusConfig"
          :key="key"
          class="list-group-item d-flex justify-content-between align-items-center py-0"
        >
          <v-list-item-title
            class="subtitle-2 flex-grow-1"
            style="user-select: none"
          >
            {{ entry.title }}
          </v-list-item-title>
          <v-menu
            class="flex-grow-1"
            offset-y
          >
            <template #activator="{ on }">
              <v-btn
                class="subtitle-2"
                style="border-radius: 2px"
                small
                v-on="on"
              >
                {{ option2text(key, selectedOptions[key]) }}
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item
                v-for="(text, i) in entry.optionsText"
                :key="entry.options[i]"
                @click="clickMenuOption(key, entry.options[i])"
              >
                <v-list-item-title>{{ text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
      </v-list>
      -->
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapState } from 'vuex';
import VMenusFlat from './VMenusFlat.vue';

enum NodeTypes {
  data = 'data',
  process = 'process',
  decision = 'decision',
  terminal = 'terminal',
}

type Node = {
  title: string,
  type: NodeTypes,
  x: number,
  y: number,
  config: {
    [key: string]: {
      title: string;
      options: unknown[];
      optionsText: string[];
    }
  };
}

const menusConfig: {
  [key: string]: {
    title: string;
    options: unknown[];
    optionsText: string[];
  }
} = {
  itemsPerRow: {
    title: 'Data Objects Per Row',
    options: [1, 4, 8, 12],
    optionsText: ['1', '4', '8', '12'],
  },
  itemsPerCol: {
    title: 'Data Objects Per Column',
    options: [1, 2, 4, 6, 8],
    optionsText: ['1', '2', '4', '6', '8'],
  },
};

export default Vue.extend({
  name: 'TheInteractiveLabelingMenu',
  components: {
    VMenusFlat,
  },
  data() {
    return {
      title: 'Interactive Labeling',
      graph: {
        nodes: [
          {
            config: {
              itemsPerRow: menusConfig.itemsPerRow,
              itemsPerCol: menusConfig.itemsPerCol,
            },
          },
        ],
      },
    };
  },
  computed: {
    ...mapState('workflow', [
      'itemsPerRow',
      'itemsPerCol',
    ]),
    settings() {
      const {
        itemsPerRow,
        itemsPerCol,
      } = this;

      return {
        itemsPerRow,
        itemsPerCol,
      };
    },
  },
  methods: {
    ...mapActions('workflow', [
      'setFeatureExtractionMethod',
      'setSamplingStrategy',
      'setNBatch',
      'setDefaultLabelingMethod',
      'setShowDatasetOverview',
      'setItemsPerRow',
      'setItemsPerCol',
      'setLabelTasks',
    ]),
    onClickGraphNode(node: Node) {
      this.selectedNode = node;
    },
    onClickMenuOption(menuKey: string, option: unknown): void {
      if (menuKey === 'itemsPerRow') {
        this.setItemsPerRow(option as number);
      }
      if (menuKey === 'itemsPerCol') {
        this.setItemsPerCol(option as number);
      }
    },
  },
});
</script>
