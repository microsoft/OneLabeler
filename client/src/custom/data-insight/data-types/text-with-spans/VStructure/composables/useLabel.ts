import { Ref, computed, ComputedRef } from '@vue/composition-api';
import {
  Category,
  ILabel,
  ILabelRelation,
  ILabelTextSpan,
} from '@/commons/types';

interface Template {
  [key: string]: Category[];
}

interface Tuple {
  [key: string]: ILabelTextSpan | null;
}

const useLabel = (label: Ref<ILabel | null>) => {
  /** Computed label spans. */
  const spans: ComputedRef<ILabelTextSpan[] | null> = computed(() => (
    label.value?.spans ?? null
  ));

  /** Get all the spans that belongs to the category. */
  const getSpansByCategory = (category: Category): ILabelTextSpan[] => {
    if (spans.value === null) return [];
    return spans.value.filter((d) => d.category === category);
  };

  /** Get all the spans that belongs to any of the categories. */
  const getSpansByCategories = (categories: Category[]): ILabelTextSpan[] => {
    if (spans.value === null) return [];
    return spans.value.filter((d) => categories.includes(d.category));
  };

  /**
   * Get the text of a span that belongs to the category.
   * When no span is found, returns the category name.
   * When multiple spans are found, returns 'multiple'.
   */
  const getSpanTextByCategory = (category: Category): string => {
    const filteredSpans = getSpansByCategory(category);
    if (filteredSpans.length === 0) return category;
    if (filteredSpans.length === 1) {
      return filteredSpans[0].text === null ? '' : filteredSpans[0].text;
    }
    if (filteredSpans.length >= 2) return 'multiple';
    return '';
  };

  /**
   * Get the text of a span that belongs to any of the categories.
   * When no span is found, returns categories.join(' | ').
   * When multiple spans are found, returns 'multiple'.
   */
  const getSpanTextByCategories = (categories: Category[]): string => {
    const filteredSpans = getSpansByCategories(categories);
    if (filteredSpans.length === 0) return categories.join(' | ');
    if (filteredSpans.length === 1) {
      return filteredSpans[0].text === null ? '' : filteredSpans[0].text;
    }
    if (filteredSpans.length >= 2) return 'multiple';
    return '';
  };

  /** Computed label span relations. */
  const relations: ComputedRef<ILabelRelation[] | null> = computed(() => (
    label.value?.relations ?? null
  ));

  /** Get all the spans that connects to the given span by the relations. */
  const getRelatedSpans = (span: ILabelTextSpan): ILabelTextSpan[] => {
    const { uuid } = span;
    if (spans.value === null || relations.value === null) return [];
    const linkedSourceUuids = relations.value
      .filter((d) => d.targetUuid === uuid)
      .map((d) => d.sourceUuid);
    const linkedTargetUuids = relations.value
      .filter((d) => d.sourceUuid === uuid)
      .map((d) => d.targetUuid);
    const linkedUuids = [...linkedSourceUuids, ...linkedTargetUuids];
    return spans.value.filter((d) => linkedUuids.includes(d.uuid));
  };

  /**
   * Create a tuple with multiple spans connected by the relations
   * given a seed span and the template of the tuple.
   */
  const getTupleBySpan = (span: ILabelTextSpan, template: Template): Tuple => {
    const tuple: Tuple = {};
    // Iteratively fill each property specified in the template.
    Object.entries(template).forEach((
      [key, categories]: [string, Category[]],
    ) => {
      if (categories.includes(span.category)) {
        tuple[key] = span;
        return;
      }
      // All the connected spans.
      const relatedSpans = getRelatedSpans(span)
        .filter((d) => categories.includes(d.category));
      // Fill the tuple with a span.
      tuple[key] = relatedSpans.length !== 1 ? null : relatedSpans[0];
    });
    return tuple;
  };

  /**
   * Create a list of tuples with all the existing spans.
   * Each tuple contains multiple spans connected by the relations.
   * Each tuple is stored according to the schema of the template.
   */
  const getTuples = (template: Template): Tuple[] => {
    let tuples: Tuple[] = [];
    Object.entries(template).forEach((
      [key, categories]: [string, Category[]],
    ) => {
      // The uuids of spans that have already been used to create tuples.
      const usedUuids = tuples.filter((d) => d[key] !== null)
        .map((d) => d[key].uuid);
      const newSpans = getSpansByCategories(categories)
        .filter((d) => !usedUuids.includes(d.uuid));
      const newTuples = newSpans.map((span) => getTupleBySpan(span, template));
      tuples = [...tuples, ...newTuples];
    });
    return tuples;
  };

  return {
    spans,
    getRelatedSpans,
    getSpansByCategory,
    getSpansByCategories,
    getSpanTextByCategory,
    getSpanTextByCategories,
    getTupleBySpan,
    getTuples,
  };
};

export default useLabel;
