<template>
  <VDialogButton
    dialog-header-title="Add New Class Option"
    max-width="400px"
    :button-icon="$vuetify.icons.values.add"
    button-title="Add Class"
    @click:close="onClickClose"
  >
    <template #dialog-body>
      <!-- The list of existing categories. -->
      <TheCategoryEntry
        v-for="(category, i) in [unlabeledMark, ...categories]"
        :key="i"
        :category="category"
        :label-tasks="labelTasks"
        :category-tasks="categoryTasks"
        :unlabeled-mark="unlabeledMark"
        :label2color="label2color"
        class="pa-1"
        @set:category-tasks="$emit('set:category-tasks', $event)"
        @upsert:color-mapper="$emit('upsert:color-mapper', $event)"
        @remove:category="$emit('remove:category', $event)"
      />

      <!-- The text input for category name. -->
      <v-form
        ref="form"
        v-model="classNameValid"
        @submit.prevent
      >
        <v-text-field
          v-model="className"
          :rules="classNameRules"
          label="Class Name"
          required
          desnse
        />
        <v-btn
          x-small
          class="view-header-button subtitle-2"
          type="submit"
          @click="onClickAddClassOption(className)"
        >
          submit
        </v-btn>
      </v-form>
    </template>
  </VDialogButton>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue';
import { Category, LabelTaskType } from '@/commons/types';
import VDialogButton from './VDialogButton.vue';
import TheCategoryEntry from './TheCategoryEntry.vue';

type InputValidator = (input: unknown) => true | string;

export default Vue.extend({
  name: 'TheClassesDialog',
  components: {
    VDialogButton,
    TheCategoryEntry,
  },
  props: {
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    labelTasks: {
      type: Array as PropType<LabelTaskType[]>,
      required: true,
    },
    categoryTasks: {
      type: Object as PropType<Record<Category, LabelTaskType[] | null>>,
      required: true,
    },
    unlabeledMark: {
      type: String as PropType<Category>,
      required: true,
    },
    label2color: {
      type: Function as PropType<(label: string) => string>,
      required: true,
    },
  },
  data() {
    return {
      className: null,
      classNameValid: true,
    };
  },
  computed: {
    classNameRules(): InputValidator[] {
      const { categories, unlabeledMark } = this;
      const notEmpty = (v: unknown) => (
        !!v
        || 'Class name cannot be empty string'
      );
      const notRepetitive = (v: unknown) => (
        (!(categories.findIndex((d: Category) => d === v) >= 0) && !(unlabeledMark === v))
        || 'Class name exists'
      );
      return [notEmpty, notRepetitive];
    },
  },
  methods: {
    onClickAddClassOption(className: string): void {
      const form = this.$refs.form as HTMLFormElement;
      // validate the input class option
      form.validate();
      if (this.classNameValid) {
        this.$emit('add:category', className);
        // reset the input class name and input validation state after submit
        this.className = null;
        form.resetValidation();
      }
    },
    onClickClose(): void {
      // reset the input class name and input validation state after closing the dialog
      this.className = null;
      const form = this.$refs.form as HTMLFormElement;
      form.resetValidation();
    },
  },
});
</script>
