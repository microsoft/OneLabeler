<template>
  <v-menu
    v-if="strokeLabel !== null"
    offset-y
  >
    <template #activator="{ on }">
      <v-btn
        :disabled="disabled"
        width="85"
        class="view-header-button subtitle-2 pl-1 text-none"
        title="Set Stroke Color"
        x-small
        v-on="on"
      >
        {{ `${strokeLabelMenu.length !== 0
          ? strokeLabelMenu[strokeLabelIndex].category : ''}` }}
        <v-spacer />
        <v-icon
          v-if="strokeLabelMenu.length !== 0"
          aria-hidden="true"
          small
          :style="`color: ${strokeLabelMenu[strokeLabelIndex].color}`"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-list-item
        v-for="option in strokeLabelMenu"
        :key="option.category"
        class="subtitle-2"
        style="min-height: 30px"
        @click="onSetStrokeLabel(option.category)"
      >
        {{ `${option.category}` }}
        <div style="flex-grow: 1" />
        <v-icon
          class="pl-1"
          style="float: right"
          aria-hidden="true"
          small
          :style="`color: ${option.color}`"
        >
          $vuetify.icons.values.square
        </v-icon>
      </v-list-item>
    </v-list>
  </v-menu>
  <v-btn
    v-else
    class="view-header-button subtitle-2"
    width="85"
    title="Set Stroke Color"
    x-small
    disabled
    icon
  >
    Color
  </v-btn>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category, ILabelCategory } from '@/commons/types';

export default Vue.extend({
  name: 'VStrokeColorMenu',
  props: {
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    strokeLabel: {
      type: String as PropType<ILabelCategory | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
    disabled: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  computed: {
    strokeLabelMenu(): { category: Category, color: string }[] {
      const { classes, label2color } = this;
      return classes.map((d: Category) => ({
        category: d,
        color: label2color(d),
      }));
    },
    strokeLabelIndex(): number {
      const { strokeLabel, strokeLabelMenu } = this;
      const index = strokeLabelMenu.findIndex((d) => d.category === strokeLabel);
      return index;
    },
  },
  methods: {
    onSetStrokeLabel(strokeLabel: Category): void {
      this.$emit('set:stroke-label', strokeLabel);
    },
  },
});
</script>
