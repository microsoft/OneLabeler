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
                @click="onClickMenuOption(key, entry.options[i])"
              >
                <v-list-item-title>{{ text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
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

export default Vue.extend({
  name: 'VMenusFlat',
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
      const index = options.findIndex((ele: unknown) => ele === option);
      console.assert(index >= 0, 'invalid value for menu', menuKey, option);
      return optionsText[index];
    },
    onClickMenuOption(menuKey: string, option: unknown): void {
      this.$emit('click:menu-option', menuKey, option);
    },
  },
});
</script>
