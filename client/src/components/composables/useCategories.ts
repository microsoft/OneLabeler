import type { Ref } from '@vue/composition-api';
import type { Category, LabelTaskType } from '@/commons/types';

/** Get continuously updated element size. */
const useFilterCategories = (categoryTasks: Ref<Record<Category, LabelTaskType[] | null>>) => {
  // Filter the concerned categories given the label task.
  const filterCategories = (labelTask: LabelTaskType): Category[] => (
    Object.entries(categoryTasks.value)
      .filter(([, usedInTasks]) => (
        // setting the tasks to null means that the category is
        // used in all tasks
        usedInTasks === null || usedInTasks.includes(labelTask)
      )).map((d) => d[0])
  );

  return { filterCategories };
};

export default useFilterCategories;
