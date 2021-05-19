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
      {{ `${nTotal} data objects` }}
    </span>
    <v-divider
      style="position: fixed"
      vertical
    />
    <span
      class="mx-2 subtitle-2 grey--text text--lighten-2"
      style="display: inline-flex; align-items: center; height: 100%;"
    >
      {{ `${nLabeled} / ${nTotal} labeled` }}
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
import { mapActions, mapState } from 'vuex';
import { Category, IStatusStorage, StatusType } from '@/commons/types';
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
      nTotal: 0,
      nLabeled: 0,
    };
  },
  computed: {
    ...mapState(['statuses', 'classes', 'unlabeledMark']),
    classNameRules() {
      const { classes, unlabeledMark } = this;
      const notEmpty = (v: unknown) => (
        !!v
        || 'Class name cannot be empty string'
      );
      const notRepetitive = (v: unknown) => (
        (!(classes.findIndex((d: Category) => d === v) >= 0) && !(unlabeledMark === v))
        || 'Class name exists'
      );
      return [
        notEmpty,
        notRepetitive,
      ];
    },
  },
  watch: {
    async statuses() {
      await this.setData();
    },
  },
  async mounted() {
    await this.setData();
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
    async setData(): Promise<void> {
      this.nLabeled = await this.getNLabeled();
      this.nTotal = await this.getNTotal();
    },
    async getNLabeled(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count((d) => d.value === StatusType.Labeled);
    },
    async getNTotal(): Promise<number> {
      const { statuses } = this as { statuses: IStatusStorage | null };
      if (statuses === null) return 0;
      return statuses.count();
    },
  },
});
</script>
