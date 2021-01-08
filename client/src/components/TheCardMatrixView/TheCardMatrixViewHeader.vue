<template>
  <v-card-title class="view-header">
    <v-icon
      class="px-2"
      aria-hidden="true"
      small
    >
      $vuetify.icons.values.image
    </v-icon>
    Sampled Object Details
    <v-spacer />

    <!-- The set batch labels menu. -->
    <v-menu offset-y>
      <template #activator="{ on }">
        <v-btn
          x-small
          class="view-header-button subtitle-2"
          v-on="on"
        >
          Set Batch Labels
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(entry, i) in classes"
          :key="i"
          style="min-height: 30px"
          @click="onClickSetBatchLabels(entry)"
        >
          <v-list-item-title
            height="20"
            class="subtitle-2 pa-0 ma-0"
            style="height: 20px"
          >
            {{ entry }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <!-- The create new class option button. -->
    <VDialogButton
      dialog-header-title="Add New Class Option"
      max-width="400px"
      :button-icon="$vuetify.icons.values.add"
      button-title="Add Class"
      @click-close-dialog="onClickCloseDialog"
    >
      <template #dialog-body>
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

    <!-- The confirm batch label button. -->
    <v-btn
      title="Confirm (Enter)"
      class="view-header-button ml-2"
      x-small
      icon
      @click="onClickConfirmBatchLabels"
    >
      <v-icon
        aria-hidden="true"
        small
        color="black"
        class="px-0"
      >
        $vuetify.icons.values.confirm
      </v-icon>
    </v-btn>
  </v-card-title>
</template>

<script lang="ts">
import Vue from 'vue';
import { Label } from '@/types';
import VDialogButton from './VDialogButton.vue';

export default Vue.extend({
  name: 'TheCardMatrixViewHeader',
  components: {
    VDialogButton,
  },
  props: {
    classes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      className: null,
      classNameRules: [
        (v: unknown) => !!v || 'Class name cannot be empty string',
      ],
      classNameValid: true,
    };
  },
  methods: {
    onClickAddClassOption(className: string): void {
      // validate the input class option
      (this.$refs.form as HTMLFormElement).validate();
      if (this.classNameValid) {
        this.$emit('click-add-class-option', className);
        // reset the input class name and input validation state after submit
        this.className = null;
        (this.$refs.form as HTMLFormElement).resetValidation();
      }
    },
    onClickCloseDialog(): void {
      // reset the input class name and input validation state after closing the dialog
      this.className = null;
      (this.$refs.form as HTMLFormElement).resetValidation();
    },
    onClickConfirmBatchLabels(): void {
      this.$emit('click-confirm-batch-labels');
    },
    onClickSetBatchLabels(label: Label): void {
      this.$emit('click-set-batch-labels', label);
    },
  },
});
</script>
