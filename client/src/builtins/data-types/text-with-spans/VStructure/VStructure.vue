<template>
  <div
    class="px-2"
    style="flex: 1 1 auto"
  >
    <component
      :is="component"
      :label="label"
      :label2color="label2color"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { ILabel, ILabelCategory } from '@/commons/types';
import VStructureAggregation from './VStructureAggregation.vue';
import VStructureAssociation from './VStructureAssociation.vue';
import VStructureCategorization from './VStructureCategorization.vue';
import VStructureDifference from './VStructureDifference.vue';
import VStructureDistribution from './VStructureDistribution.vue';
import VStructureEnumeration from './VStructureEnumeration.vue';
import VStructureExtreme from './VStructureExtreme.vue';
import VStructureProportion from './VStructureProportion.vue';
import VStructureRank from './VStructureRank.vue';
import VStructureTrend from './VStructureTrend.vue';
import VStructureValue from './VStructureValue.vue';

enum SentenceCategory {
  aggregation = 'aggregation',
  association = 'association',
  categorization = 'categorization',
  difference = 'difference',
  distribution = 'distribution',
  enumeration = 'enumeration',
  extreme = 'extreme',
  outlier = 'outlier',
  proportion = 'proportion',
  rank = 'rank',
  trend = 'trend',
  value = 'value',
  noDataFact = 'noDataFact',
  others = 'others',
}

export default Vue.extend({
  name: 'VStructure',
  props: {
    label: {
      type: Object as PropType<ILabel | null>,
      default: null,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  computed: {
    labelCategory(): ILabelCategory | null {
      return this.label?.category ?? null;
    },
    component(): Vue.VueConstructor | null {
      const category = this.labelCategory;
      if (category === SentenceCategory.aggregation) return VStructureAggregation;
      if (category === SentenceCategory.association) return VStructureAssociation;
      if (category === SentenceCategory.categorization) return VStructureCategorization;
      if (category === SentenceCategory.difference) return VStructureDifference;
      if (category === SentenceCategory.distribution) return VStructureDistribution;
      if (category === SentenceCategory.enumeration) return VStructureEnumeration;
      if (category === SentenceCategory.extreme) return VStructureExtreme;
      if (category === SentenceCategory.proportion) return VStructureProportion;
      if (category === SentenceCategory.rank) return VStructureRank;
      if (category === SentenceCategory.trend) return VStructureTrend;
      if (category === SentenceCategory.value) return VStructureValue;
      return null;
    },
  },
});
</script>
