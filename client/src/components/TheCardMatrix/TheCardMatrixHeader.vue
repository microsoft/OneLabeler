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
        $vuetify.icons.values.image
      </v-icon>
      Sampled Objects
    </template>
    <template #tools>
      <!-- The set batch labels menu. -->
      <v-menu
        v-if="enableClassification"
        offset-y
      >
        <template #activator="{ on }">
          <v-btn
            x-small
            class="view-header-button subtitle-2 ml-2"
            v-on="on"
          >
            Set Batch Labels
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-for="(entry, i) in [...classes, unlabeledMark]"
            :key="i"
            class="subtitle-2"
            style="min-height: 30px"
            @click="onClickBatchLabel(entry)"
          >
            {{ entry }}
            <div style="flex-grow: 1" />
            <v-icon
              aria-hidden="true"
              small
              :style="`color: ${label2color(entry)}`"
            >
              $vuetify.icons.values.square
            </v-icon>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </VToolbar>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category, LabelTaskType } from '@/commons/types';
import VToolbar from '@/components/VWindow/VToolbar.vue';

export default Vue.extend({
  name: 'TheCardMatrixHeader',
  components: { VToolbar },
  props: {
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    classes: {
      type: Array as PropType<Category[]>,
      default: () => [],
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  computed: {
    enableClassification(): boolean {
      return this.labelTasks.findIndex(
        (d: LabelTaskType) => d === LabelTaskType.Classification,
      ) >= 0;
    },
  },
  methods: {
    onClickBatchLabel(label: Category): void {
      this.$emit('click:batch-label', label);
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
