<template>
  <div
    class="card-elevated"
    style="display: flex; flex-direction: column;"
  >
    <div class="card-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Label Class Distribution
    </div>
    <v-divider />
    <div
      class="px-4"
      style="flex: 1 1 auto; overflow-y: scroll;"
    >
      <div
        v-for="category in categories"
        :key="category"
        style="min-height: 40px"
      >
        <div style="display: flex">
          <span style="font-weight: 700">
            {{ category }}
          </span>
          <div style="flex-grow: 1" />
          {{
            `${ category in nLabeledByCategory ? nLabeledByCategory[category] : 0 }
            / ${nLabeled}`
          }}
        </div>
        <div style="position: relative; height: 13px;">
          <div
            :style="{
              'position': 'absolute',
              'background-color': '#d9d9d9',
              'height': '100%',
              'width': '100%',
            }"
          />
          <div
            :style="{
              'position': 'absolute',
              'background-color': '#0078d4',
              'height': '100%',
              'width': `${
                (category in nLabeledByCategory ? nLabeledByCategory[category] : 0)
                / nLabeled * 100
              }%`,
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex';
import { StatusType } from '@/commons/types';
import type {
  Category,
  ILabelStorage,
  IStatusStorage,
  LabelTaskType,
} from '@/commons/types';

const isOverlapping = (a: Set<unknown>, b: Set<unknown>): boolean => {
  const delta = new Set([...a, ...b]).size - a.size - b.size;
  return delta !== 0;
};

export default {
  name: 'TheDashboardLabelDistributionView',
  data() {
    return {
      nLabeled: 0,
      nLabeledByCategory: {} as Record<Category, number>,
    };
  },
  computed: {
    ...mapState([
      'categoryTasks',
      'labels',
      'statuses',
    ]),
    ...mapGetters('workflow', ['labelTasks']),
    categories(): Category[] {
      const categoryTasks = this.categoryTasks as Record<Category, LabelTaskType[]>;
      const labelTasks = this.labelTasks as LabelTaskType[];
      return Object.entries(categoryTasks)
        .filter(([, usedInTasks]) => (
          usedInTasks === null || isOverlapping(new Set(usedInTasks), new Set(labelTasks))
        )).map((d) => d[0]);
    },
  },
  watch: {
    async categories() {
      this.nLabeledByCategory = await this.getNLabeledByCategory();
    },
    async labels() {
      this.nLabeledByCategory = await this.getNLabeledByCategory();
    },
    async statuses() {
      this.nLabeled = await this.getNLabeled();
      this.nLabeledByCategory = await this.getNLabeledByCategory();
    },
  },
  async mounted() {
    this.nLabeled = await this.getNLabeled();
    this.nLabeledByCategory = await this.getNLabeledByCategory();
  },
  methods: {
    async getNLabeled(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count({ value: StatusType.Labeled });
    },
    async getNLabeledOf(category: Category): Promise<number> {
      // Note: the number of labels of a category depends on both labels and statuses.
      const { labels } = this as { labels: ILabelStorage | null };
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (labels === null || statuses === null) return 0;
      const labelValues = await labels.getFiltered({ category });
      const uuids = labelValues.map((d) => d.uuid);
      const n = (await statuses.getBulk(uuids)).filter((d) => (
        (d !== undefined) && (d.value === StatusType.Labeled)
      )).length;
      return n;
    },
    async getNLabeledByCategory(): Promise<Record<Category, number>> {
      const nLabeledByCategory: Record<Category, number> = {};
      await Promise.all(this.categories.map(async (category: Category) => {
        const n = await this.getNLabeledOf(category);
        nLabeledByCategory[category] = n;
      }));
      return nLabeledByCategory;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/main.sass';
.card {
  background-color: white;
  border: thin solid rgba(0,0,0,.12);
  border-radius: 4px;
}
.card-elevated {
  @extend .elevation-2;
  @extend .card;
}
</style>
