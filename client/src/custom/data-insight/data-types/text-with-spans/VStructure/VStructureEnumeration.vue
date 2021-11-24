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
      v-for="(span, i) in getSpansByCategory(Tag.partName)"
      :key="i"
    >
      part [{{ i }}] :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.partName) }">
        &lt;{{ span === null ? '' : span.text }}&gt;
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
import type { ILabel } from '@/commons/types';
import useColor from './composables/useColor';
import useLabel from './composables/useLabel';

enum Tag {
  wholeName = 'whole - name',
  partName = 'part - name',
}

export default defineComponent({
  name: 'VStructureEnumeration',
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
    const { spans, getSpansByCategory, getSpanTextByCategory } = useLabel(label);
    return {
      spans,
      getColorByCategory,
      getSpansByCategory,
      getSpanTextByCategory,
    };
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
