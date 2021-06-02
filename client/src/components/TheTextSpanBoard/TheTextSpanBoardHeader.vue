<template>
  <VToolbar
    @window:minimize="onClickMinimize"
    @window:pin="onClickPin"
  >
    <template #title>
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.text
      </v-icon>
      Text
    </template>
    <template #tools>
      <template v-if="enableClassification">
        <v-divider class="mx-2" vertical />
        <v-menu offset-y>
          <template #activator="{ on }">
            <v-btn
              :color="label === null ? '' : label2color(label.category)"
              class="view-header-button subtitle-2"
              x-small
              v-on="on"
            >
              {{ label === null ? '' : label.category }}
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              v-for="(entry, i) in classes"
              :key="i"
              class="subtitle-2"
              style="min-height: 30px"
              @click="onSetLabelCategory(entry)"
            >
              {{ entry }}
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-if="enableSpanClassification">
        <v-divider class="mx-2" vertical />
        <v-btn
          v-for="category in classes"
          :key="category"
          class="view-header-button subtitle-2 mr-1 elevation-0 text-none"
          :class="{ 'white--text': category === brushCategory }"
          :style="{
            'border-color': '#bbb',
            'background-color': category === brushCategory
              ? label2color(category)
              : undefined,
          }"
          x-small
          outlined
          @click="onSetBrushCategory(category)"
        >
          {{ category }}
          <v-icon
            class="pl-2"
            aria-hidden="true"
            small
            :style="`color: ${label2color(category)}`"
          >
            $vuetify.icons.values.square
          </v-icon>
        </v-btn>
      </template>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category, ILabel, LabelTaskType } from '@/commons/types';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default Vue.extend({
  name: 'TheTextSpanBoardHeader',
  components: { VToolbar },
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    brushCategory: {
      type: String as PropType<Category | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(category: string) => string>,
      required: true,
    },
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
  },
  computed: {
    enableClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.Classification,
      ) >= 0;
    },
    enableSpanClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.SpanClassification,
      ) >= 0;
    },
  },
  methods: {
    onSetBrushCategory(category: Category) {
      this.$emit('set:brush-category', category);
    },
    onSetLabelCategory(category: Category): void {
      this.$emit('set:label-category', category);
    },
    onClickMinimize() {
      this.$emit('window:minimize');
    },
    onClickPin() {
      this.$emit('window:pin');
    },
  },
});
</script>
