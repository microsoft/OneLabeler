<template>
  <v-toolbar
    dense
    class="app-footer"
    :height="height"
  >
    <v-toolbar-title class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${dataObjects.length} data objects` }}
    </v-toolbar-title>
    <v-divider
      class="app-footer-divider"
      vertical
    />
    <v-toolbar-title class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${dataObjects.length - unlabeledIndices.length} / ${dataObjects.length} labeled` }}
    </v-toolbar-title>
    <v-divider
      class="app-footer-divider"
      vertical
    />
    <v-toolbar-title class="ml-2 mr-1 subtitle-2 grey--text text--lighten-2">
      {{ `${classes.length} classes` }}
    </v-toolbar-title>
    <!-- The create new class option button. -->
    <VDialogButton
      dialog-header-title="Add New Class Option"
      max-width="400px"
      :button-icon="$vuetify.icons.values.add"
      button-title="Add Class"
      @click:close="onClickClose"
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
    <v-divider
      class="app-footer-divider"
      vertical
    />
  </v-toolbar>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { Label } from '@/commons/types';
import VDialogButton from './VDialogButton.vue';

export default Vue.extend({
  name: 'TheFooterView',
  components: {
    VDialogButton,
  },
  props: {
    height: {
      default: 40,
      type: Number,
    },
  },
  data() {
    return {
      className: null,
      classNameValid: true,
    };
  },
  computed: {
    ...mapState(['dataObjects', 'classes', 'unlabeledMark']),
    ...mapGetters(['unlabeledIndices']),
    classNameRules() {
      const { classes, unlabeledMark } = this;
      const notEmpty = (v: unknown) => (
        !!v
        || 'Class name cannot be empty string'
      );
      const notRepetitive = (v: unknown) => (
        (!(classes.findIndex((d: Label) => d === v) >= 0) && !(unlabeledMark === v))
        || 'Class name exists'
      );
      return [
        notEmpty,
        notRepetitive,
      ];
    },
  },
  methods: {
    ...mapActions(['pushClasses']),
    onClickAddClassOption(className: string): void {
      // validate the input class option
      (this.$refs.form as HTMLFormElement).validate();
      if (this.classNameValid) {
        this.pushClasses(className);
        // reset the input class name and input validation state after submit
        this.className = null;
        (this.$refs.form as HTMLFormElement).resetValidation();
      }
    },
    onClickClose(): void {
      // reset the input class name and input validation state after closing the dialog
      this.className = null;
      (this.$refs.form as HTMLFormElement).resetValidation();
    },
  },
});
</script>
