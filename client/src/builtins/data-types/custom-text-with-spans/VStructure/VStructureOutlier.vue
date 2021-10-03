<template>
  <div>
    <p>
      whole :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.wholeName) }">
        &lt;{{ getSpanTextByCategory(Tag.wholeName) }}&gt;
      </span>
      }
    </p>
    <p>
      outlier object :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectName) }">
        &lt;{{ getSpanTextByCategory(Tag.objectName) }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectValue) }">
        &lt;{{ getSpanTextByCategory(Tag.objectValue) }}&gt;
      </span>
      }
    </p>
    <p>
      condition :-
      <span :style="{ 'background-color': getColorByCategory(Tag.condition) }">
        &lt;{{ getSpanTextByCategory(Tag.condition) }}&gt;
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
  objectName = 'outlier - name',
  objectValue = 'outlier - value',
  condition = 'condition',
}

export default defineComponent({
  name: 'VStructureOutlier',
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
