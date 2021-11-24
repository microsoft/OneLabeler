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
      v-for="({ name, value, index }, i) in tuples"
      :key="i"
    >
      part [{{ i }}] :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectName) }">
        &lt;{{ name === null ? '' : name.text }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectValue) }">
        &lt;{{ value === null ? '' : value.text }}&gt;
      </span>
      , index:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectIndex) }">
        &lt;{{ index === null ? '' : index.text }}&gt;
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
import type { ILabel, ILabelTextSpan } from '@/commons/types';
import useColor from './composables/useColor';
import useLabel from './composables/useLabel';

enum Tag {
  wholeName = 'whole - name',
  objectName = 'object - name',
  objectValue = 'object - value',
  objectIndex = 'object - index',
}

type Tuple = {
  [key in 'name' | 'value' | 'index']: ILabelTextSpan | null;
}

export default defineComponent({
  name: 'VStructureRank',
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
        name: [Tag.objectName],
        value: [Tag.objectValue],
        index: [Tag.objectIndex],
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
