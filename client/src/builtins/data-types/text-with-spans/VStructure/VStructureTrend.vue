<template>
  <div>
    <p>
      object :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectName) }">
        &lt;{{ getSpanTextByCategories([Tag.objectName]) }}&gt;
      </span>
      }
    </p>
    <p
      v-for="({ time, value }, i) in tuples"
      :key="i"
    >
      part [{{ i }}] :- { time:
      <span
        :style="{ 'background-color': time === null
          ? undefined : getColorByCategory(time.category) }"
      >
        &lt;{{ time === null ? '' : time.text }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectValue) }">
        &lt;{{ value === null ? '' : value.text }}&gt;
      </span>
      }
    </p>
    <p>
      relation :- { type:
      <span :style="{ 'background-color': relationColor }">
        &lt;{{ relationTypeText }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': relationColor }">
        &lt;{{ getSpanTextByCategories(relationTags) }}&gt;
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
  timeStart = 'time - start',
  timeEnd = 'time - end',
  timeOthers = 'time - others',
  relationIncreasing = 'relation - increasing',
  relationDecreasing = 'relation - decreasing',
  relationStable = 'relation - stable',
  relationOthers = 'relation - others',
}

type Tuple = {
  [key in 'time' | 'value']: ILabelTextSpan | null;
}

export default defineComponent({
  name: 'VStructureTrend',
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
      getSpanTextByCategories,
      getRelatedSpans,
      getTuples,
    } = useLabel(label);
    return {
      spans,
      getColorByCategory,
      getSpansByCategories,
      getSpanTextByCategories,
      getRelatedSpans,
      getTuples,
    };
  },
  data() {
    return {
      Tag,
      timeTags: [
        Tag.timeStart,
        Tag.timeEnd,
        Tag.timeOthers,
      ],
      relationTags: [
        Tag.relationIncreasing,
        Tag.relationDecreasing,
        Tag.relationStable,
        Tag.relationOthers,
      ],
    };
  },
  computed: {
    relationTypeText(): string {
      const spans = this.getSpansByCategories(this.relationTags);
      const unique = [...new Set(spans.map((d) => d.category))];
      if (unique.length === 0) return 'increasing | decreasing | stable | others';
      if (unique.length === 1) return unique[0];
      return 'multiple';
    },
    relationColor(): string | undefined {
      const categories = this.getSpansByCategories(this.relationTags)
        .map((d) => d.category);
      const unique = [...new Set(categories)];
      if (unique.length !== 1) return undefined;
      return this.getColorByCategory(unique[0]);
    },
    tuples(): Tuple[] {
      return this.getTuples({
        time: this.timeTags,
        value: [Tag.objectValue],
      }) as Tuple[];
    },
  },
});
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
