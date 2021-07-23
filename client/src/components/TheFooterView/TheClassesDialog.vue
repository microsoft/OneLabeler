<template>
  <VDialogButton
    dialog-header-title="Add New Class Option"
    max-width="400px"
    :button-icon="$vuetify.icons.values.add"
    button-title="Add Class"
    @click:close="onClickClose"
  >
    <template #dialog-body>
      <div
        v-for="(category, i) in classes"
        :key="i"
        class="pa-1"
        style="display: flex; align-items: center; border: thin solid rgba(0,0,0,.12);"
      >
        <div
          class="px-1"
          style="display: flex; align-items: center;
            font-size: 0.875rem; height: 20px;
            border: thin solid rgba(0,0,0,.12); border-radius: 2px;"
        >
          {{ category }}
          <v-icon
            class="pl-1"
            aria-hidden="true"
            small
            :style="{ color: label2color(category) }"
          >
            $vuetify.icons.values.square
          </v-icon>
        </div>
        <v-spacer />
        <v-btn
          title="remove"
          class="view-header-button elevation-0"
          style="border-color: #bbb"
          x-small
          icon
          outlined
          @click="$emit('remove:category', category)"
        >
          <v-icon
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.reset
          </v-icon>
        </v-btn>
      </div>
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
import { Category } from '@/commons/types';
import VDialogButton from './VDialogButton.vue';

type InputValidator = (input: unknown) => true | string;

export default Vue.extend({
  name: 'TheClassesDialog',
  components: { VDialogButton },
  props: {
    classes: {
      type: Array as PropType<Category[]>,
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
      const { classes, unlabeledMark } = this;
      const notEmpty = (v: unknown) => (
        !!v
        || 'Class name cannot be empty string'
      );
      const notRepetitive = (v: unknown) => (
        (!(classes.findIndex((d: Category) => d === v) >= 0) && !(unlabeledMark === v))
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
