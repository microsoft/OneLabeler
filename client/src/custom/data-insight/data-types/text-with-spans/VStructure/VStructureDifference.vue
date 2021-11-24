<template>
  <div>
    <p>
      object A :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.AName) }">
        &lt;{{ getSpanTextByCategories([Tag.AName]) }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.AValue) }">
        &lt;{{ getSpanTextByCategories([Tag.AValue]) }}&gt;
      </span>
      }
    </p>
    <p>
      object B :- { name:
      <span :style="{ 'background-color': getColorByCategory(Tag.BName) }">
        &lt;{{ getSpanTextByCategories([Tag.BName]) }}&gt;
      </span>
      , value:
      <span :style="{ 'background-color': getColorByCategory(Tag.BValue) }">
        &lt;{{ getSpanTextByCategories([Tag.BValue]) }}&gt;
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
import type { ILabel } from '@/commons/types';
import useColor from './composables/useColor';
import useLabel from './composables/useLabel';

enum Tag {
  AName = 'A - name',
  AValue = 'A - value',
  BName = 'B - name',
  BValue = 'B - value',
  relationMore = 'relation - more',
  relationLess = 'relation - less',
  relationSimilar = 'relation - similar',
  relationOthers = 'relation - others',
}

export default defineComponent({
  name: 'VStructureDifference',
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
      relationTags: [
        Tag.relationMore,
        Tag.relationLess,
        Tag.relationSimilar,
        Tag.relationOthers,
      ],
    };
  },
  computed: {
    relationTypeText(): string {
      const spans = this.getSpansByCategories(this.relationTags);
      const unique = [...new Set(spans.map((d) => d.category))];
      if (unique.length === 0) return 'more | less | similar | others';
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
  },
});
</script>

<style scoped>
span {
  display: inline-block;
}
</style>
