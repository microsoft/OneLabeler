<template>
  <div>
    <p>
      whole :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.wholeName) }">
        &lt;{{ getSpanTextByCategory(Tag.wholeName) }}&gt;
      </span>
      }
    </p>
    <p
      v-for="({ name, condition }, i) in tuples"
      :key="i"
    >
      part [{{ i }}] :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.partName) }">
        &lt;{{ name === null ? '' :  name.text }}&gt;
      </span>
      , condition:
      <span :style="{ 'background-color': getColorByCategory(Tag.partCondition) }">
        &lt;{{ condition === null ? '' : condition.text }}&gt;
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
  wholeName = 'whole - name',
  partName = 'part - name',
  partCondition = 'part - condition',
}

type Tuple = {
  [key in 'name' | 'condition']: ILabelTextSpan | null;
}

export default defineComponent({
  name: 'VStructureCategorization',
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
        condition: [Tag.partCondition],
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
