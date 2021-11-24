<template>
  <div>
    <p>
      whole :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.wholeName) }">
        &lt;{{ getSpanTextByCategories([Tag.wholeName]) }}&gt;
      </span>
      }
    </p>
    <p>
      object :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectName) }">
        &lt;{{ getSpanTextByCategories([Tag.objectName]) }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.objectValue) }">
        &lt;{{ getSpanTextByCategories([Tag.objectValue]) }}&gt;
      </span>
      }
    </p>
    <p>
      condition :- { type:
      <span :style="{ 'background-color': conditionColor }">
        &lt;{{ conditionTypeText }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': conditionColor }">
        &lt;{{ getSpanTextByCategories(conditionTags) }}&gt;
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
  objectName = 'object - name',
  objectValue = 'object - value',
  conditionMax = 'condition - max',
  conditionMin = 'condition - min',
  conditionOthers = 'condition - others',
}

export default defineComponent({
  name: 'VStructureExtreme',
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
    const { getSpansByCategories, getSpanTextByCategories } = useLabel(label);
    return {
      getColorByCategory,
      getSpansByCategories,
      getSpanTextByCategories,
    };
  },
  data() {
    return {
      Tag,
      conditionTags: [
        Tag.conditionMax,
        Tag.conditionMin,
        Tag.conditionOthers,
      ],
    };
  },
  computed: {
    conditionTypeText(): string {
      const spans = this.getSpansByCategories(this.conditionTags);
      const unique = [...new Set(spans.map((d) => d.category))];
      if (unique.length === 0) return 'max | min | others';
      if (unique.length === 1) return unique[0];
      return 'multiple';
    },
    conditionColor(): string | undefined {
      const categories = this.getSpansByCategories(this.conditionTags)
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
