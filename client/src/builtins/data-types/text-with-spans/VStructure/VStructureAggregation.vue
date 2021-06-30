<template>
  <div>
    <p
      v-for="({ name, value }, i) in tuples"
      :key="i"
    >
      object [{{ i }}] :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectName) }">
        &lt;{{ name === null ? '' :  name.text }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectValue) }">
        &lt;{{ value === null ? '' : value.text }}&gt;
      </span>
      }
    </p>
    <p>
      result :-
      <span :style="{ 'background-color': getColorByCategory(Tag.result) }">
        &lt;{{ getSpanTextByCategory(Tag.result) }}&gt;
      </span>
    </p>
    <p>
      operation :- { type:
      <span :style="{ 'background-color': operationColor }">
        &lt;{{ operationTypeText }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': operationColor }">
        &lt;{{ getSpanTextByCategories(operationTags) }}&gt;
      </span>
      }
    </p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
} from '@vue/composition-api';
import { ILabel, ILabelTextSpan } from '@/commons/types';
import useColor from './composables/useColor';
import useLabel from './composables/useLabel';

enum Tag {
  objectName = 'object - name',
  objectValue = 'object - value',
  result = 'result',
  operationAverage = 'operation - average',
  operationMean = 'operation - mean/median',
  operationSum = 'operation - sum',
  operationOthers = 'operation - others',
}

type Tuple = {
  [key in 'name' | 'value']: ILabelTextSpan | null;
}

export default defineComponent({
  name: 'VStructureAggregation',
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
  setup(props) {
    const { label, label2color } = toRefs(props);
    const { getColorByCategory } = useColor(label2color);
    const {
      spans,
      getSpansByCategories,
      getSpanTextByCategory,
      getSpanTextByCategories,
      getTuples,
    } = useLabel(label);
    return {
      spans,
      getColorByCategory,
      getSpansByCategories,
      getSpanTextByCategory,
      getSpanTextByCategories,
      getTuples,
    };
  },
  data() {
    return {
      Tag,
      operationTags: [
        Tag.operationAverage,
        Tag.operationMean,
        Tag.operationSum,
        Tag.operationOthers,
      ],
    };
  },
  computed: {
    tuples(): Tuple[] {
      return this.getTuples({
        name: [Tag.objectName],
        value: [Tag.objectValue],
      }) as Tuple[];
    },
    operationTypeText(): string {
      const spans = this.getSpansByCategories(this.operationTags);
      const unique = [...new Set(spans.map((d) => d.category))];
      if (unique.length === 0) return 'average | mean/median | sum | others';
      if (unique.length === 1) return unique[0];
      return 'multiple';
    },
    operationColor(): string | undefined {
      const categories = this.getSpansByCategories(this.operationTags)
        .map((d) => d.category);
      const unique = [...new Set(categories)];
      if (unique.length !== 1) return undefined;
      return this.getColorByCategory(unique[0]);
    },
  },
});
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
