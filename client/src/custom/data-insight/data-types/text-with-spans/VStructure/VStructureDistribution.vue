<template>
  <div>
    <p>
      whole :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.wholeName) }">
        &lt;{{ getSpanTextByCategory(Tag.wholeName) }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.wholeValue) }">
        &lt;{{ getSpanTextByCategory(Tag.wholeValue) }}&gt;
      </span>
      }
    </p>
    <p
      v-for="({ name, value }, i) in tuples"
      :key="i"
    >
      part [{{ i }}] :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.partName) }">
        &lt;{{ name === null ? '' : name.text }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.partValue) }">
        &lt;{{ value === null ? '' : value.text }}&gt;
      </span>
      }
    </p>
    <p>
      description :-
      <span :style="{ 'background-color': getColorByCategory(Tag.description) }">
        &lt;{{ getSpanTextByCategory(Tag.description) }}&gt;
      </span>
    </p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  toRefs,
  PropType,
} from '@vue/composition-api';
import type { ILabel, ILabelTextSpan } from '@/commons/types';
import useColor from './composables/useColor';
import useLabel from './composables/useLabel';

enum Tag {
  wholeName = 'whole - name',
  wholeValue = 'whole - value',
  partName = 'part - name',
  partValue = 'part - value',
  description = 'description',
}

type Tuple = {
  [key in 'name' | 'value']: ILabelTextSpan | null;
}

export default defineComponent({
  name: 'VStructureDistribution',
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
    const { getSpanTextByCategory, getTuples } = useLabel(label);
    return {
      getColorByCategory,
      getSpanTextByCategory,
      getTuples,
    };
  },
  data() {
    return { Tag };
  },
  computed: {
    tuples(): Tuple[] {
      return this.getTuples({
        name: [Tag.partName],
        value: [Tag.partValue],
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
