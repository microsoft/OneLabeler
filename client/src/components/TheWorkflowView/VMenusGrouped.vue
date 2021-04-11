<template>
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
        <v-card
          v-for="(menuGroup, key) in menuTree"
          :key="key"
          class="pb-1"
          text
          flat
          tile
        >
          <v-card-title
            class="subtitle-2 py-1 grey lighten-4 grey--text text--darken-1 elevation-1"
            style="user-select: none"
          >
            {{ menuGroup.title }}
          </v-card-title>
          <v-list-item
            v-for="menuKey in menuGroup.menuKeys"
            :key="menuKey"
            class="list-group-item d-flex justify-content-between align-items-center py-0"
          >
            <v-list-item-title
              class="subtitle-2 flex-grow-1"
              style="user-select: none"
            >
              {{ menusConfig[menuKey].title }}
            </v-list-item-title>
            <v-menu
              class="flex-grow-1"
              offset-y
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  class="subtitle-2 elevation-1"
                  style="border-radius: 2px"
                  small
                  v-on="on"
                >
                  {{ option2text(menuKey, selectedOptions[menuKey]) }}
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  v-for="(text, i) in menusConfig[menuKey].optionsText"
                  :key="menusConfig[menuKey].options[i]"
                  @click="clickMenuOption(menuKey, menusConfig[menuKey].options[i])"
                >
                  <v-list-item-title>{{ text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-list-item>
        </v-card>
      </v-list>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';

type MenusConfig = {
  [key: string]: {
    title: string,
    options: Array<unknown>,
    optionsText: Array<string>,
  }
}

type MenusTree = {
  [key: string]: {
    title: string,
    menuKeys: Array<string>,
  }
}

export default Vue.extend({
  name: 'VMenusGrouped',
  props: {
    title: {
      type: String,
      default: 'Parameters',
    },
    /**
     * @type {Object.<String, { title: String, options: Array, optionsText: String[] }>}
     * menusConfig - The list of parameter menu configurations.
     * The keys of menusConfig are strings of menu names.
     * The entries of menusConfig are object documenting the menu information,
     * including <title, options, optionsText>.
     * title - The text to be displayed for this entry.
     * options - The options of the entry.
     * optionsText - The text to be displayed for each option.
     */
    menusConfig: {
      type: Object as PropType<MenusConfig>,
      required: true,
      validator: (value) => Object.entries(value).every(([key, entry]) => (
        (typeof key) === 'string'
        && (typeof entry.title) === 'string'
        && (typeof entry.options) === 'object'
        && (typeof entry.optionsText) === 'object'
      )),
    },
    /**
     * @type {Object.<String, { title: String, menuKeys: String[] }>}
     * menuTree - The grouping of the menus.
     * The keys of menuTree are strings of menu group names.
     * The entries of menuTree are object documenting the group information,
     * including <title, menuKeys>.
     * title - The text to be displayed for this group.
     * menuKeys - The key of menus in this group.
     */
    menuTree: {
      type: Object as PropType<MenusTree>,
      required: true,
      validator: (value) => Object.entries(value).every(([key, entry]) => (
        (typeof key) === 'string'
        && (typeof entry.title) === 'string'
        && (typeof entry.menuKeys) === 'object'
        && entry.menuKeys.every((menuKey) => (typeof menuKey) === 'string')
      )),
    },
    /**
     * @type {Object.<String, Any>} selectedOptions - The selected options in the menu.
     * The keys of selectedOptions are required to be keys of menusConfig.
     */
    selectedOptions: {
      type: Object,
      required: true,
      validator: (value) => Object.entries(value).every(([key]) => (
        (typeof key) === 'string'
      )),
    },
  },
  methods: {
    option2text(menuKey: string, option: unknown): string {
      const { optionsText, options } = this.menusConfig[menuKey];
      const index = options.findIndex((ele) => ele === option);
      console.assert(index >= 0, 'invalid value for menu', menuKey, option);
      return optionsText[index];
    },
    clickMenuOption(menuKey: string, option: unknown): void {
      this.$emit('click-menu-option', menuKey, option);
    },
  },
});
</script>
