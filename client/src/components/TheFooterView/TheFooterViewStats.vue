<template>
  <div style="display: flex; align-items: center;">
    <v-divider vertical />
    <span class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${nTotal} data objects` }}
    </span>
    <v-divider vertical />
    <span class="mx-2 subtitle-2 grey--text text--lighten-2">
      {{ `${nLabeled} / ${nTotal} labeled` }}
    </span>
    <v-divider vertical />
    <span class="ml-2 mr-1 subtitle-2 grey--text text--lighten-2">
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
            :style="{ 'border-color': '#bbb' }"
            x-small
            icon
            outlined
            @click="removeCategory(category)"
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import {
  Category,
  IDataObjectStorage,
  IStatusStorage,
  StatusType,
} from '@/commons/types';
import VDialogButton from './VDialogButton.vue';

export default Vue.extend({
  name: 'TheFooterView',
  components: { VDialogButton },
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
    ...mapState([
      'dataObjects',
      'statuses',
      'classes',
      'unlabeledMark',
    ]),
    ...mapGetters(['label2color']),
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
    async statuses(): Promise<void> {
      await this.setData();
    },
  },
  async mounted(): Promise<void> {
    await this.setData();
  },
  methods: {
    ...mapActions(['addCategory', 'removeCategory']),
    onClickAddClassOption(className: string): void {
      // validate the input class option
      (this.$refs.form as HTMLFormElement).validate();
      if (this.classNameValid) {
        this.addCategory(className);
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
      return statuses.count({ value: StatusType.Labeled });
    },
    async getNTotal(): Promise<number> {
      const { dataObjects } = this as { dataObjects: IDataObjectStorage | null };
      if (dataObjects === null) return 0;
      return dataObjects.count();
    },
  },
});
</script>
