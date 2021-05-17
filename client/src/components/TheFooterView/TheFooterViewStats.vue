<template>
  <div style="height: 100%">
    <v-divider
      style="position: fixed; display: inline-block"
      vertical
    />
    <span
      class="mx-2 subtitle-2 grey--text text--lighten-2"
      style="display: inline-flex; align-items: center; height: 100%;"
    >
      {{ `${nDataObjects} data objects` }}
    </span>
    <v-divider
      style="position: fixed"
      vertical
    />
    <span
      class="mx-2 subtitle-2 grey--text text--lighten-2"
      style="display: inline-flex; align-items: center; height: 100%;"
    >
      {{ `${nDataObjects - unlabeledIndices.length} / ${nDataObjects} labeled` }}
    </span>
    <v-divider
      style="position: fixed"
      vertical
    />
    <span
      class="ml-2 mr-1 subtitle-2 grey--text text--lighten-2"
      style="display: inline-flex; align-items: center; height: 100%;"
    >
      {{ `${classes.length} classes` }}
    </span>
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
  </div>
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
    nDataObjects(): number {
      return this.dataObjects.length;
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
