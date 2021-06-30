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
    <p>
      part :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.partName) }">
        &lt;{{ getSpanTextByCategory(Tag.partName) }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.partValue) }">
        &lt;{{ getSpanTextByCategory(Tag.partValue) }}&gt;
      </span>
      }
    </p>
    <p>
      rate :-
      <span :style="{ 'background-color': getColorByCategory(Tag.rate) }">
        &lt;{{ getSpanTextByCategory(Tag.rate) }}&gt;
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
import { ILabel } from '@/commons/types';
import useColor from './composables/useColor';
import useLabel from './composables/useLabel';

enum Tag {
  wholeName = 'whole - name',
  wholeValue = 'whole - value',
  partName = 'part - name',
  partValue = 'part - value',
  rate = 'rate',
}

export default defineComponent({
  name: 'VStructureProportion',
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
    const { getSpanTextByCategory } = useLabel(label);
    return { getColorByCategory, getSpanTextByCategory };
  },
  data() {
    return { Tag };
  },
});
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
