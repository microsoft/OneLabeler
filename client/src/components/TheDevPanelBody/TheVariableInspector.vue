<template>
  <v-card
    class="rounded-0"
    style="display: flex; flex-direction: column; width: 0;"
  >
    <div class="view-header">
      <v-icon
        class="px-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.info
      </v-icon>
      Variable Inspector
    </div>
    <v-divider />
    <div style="flex: 1 1 auto; overflow-y: scroll; height: 0;">
      <div>
        <div class="view-header">
          <v-icon
            class="px-2"
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.data
          </v-icon>
          Data Objects
        </div>
        <pre ref="dataObjects" />
      </div>

      <div>
        <div class="view-header">
          <v-icon
            class="px-2"
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.labels
          </v-icon>
          Labels
        </div>
        <pre ref="labels" />
      </div>

      <div>
        <div class="view-header">
          <v-icon
            class="px-2"
            aria-hidden="true"
            small
          >
            $vuetify.icons.values.samples
          </v-icon>
          Samples
        </div>
        <pre ref="samples" />
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import { mount } from 'object-visualizer';

export default Vue.extend({
  name: 'TheVariableInspector',
  computed: {
    ...mapState([
      'dataObjects',
      'labels',
      'queryUuids',
    ]),
  },
  watch: {
    dataObjects() {
      this.renderDataObjects();
    },
    labels() {
      this.renderLabels();
    },
    samples() {
      this.renderSamples();
    },
  },
  mounted() {
    this.renderDataObjects();
    this.renderLabels();
    this.renderSamples();
  },
  methods: {
    async renderDataObjects(): Promise<void> {
      const element = this.$refs.dataObjects as HTMLPreElement;
      const data = this.dataObjects === null
        ? null
        : await this.dataObjects.getAll();
      mount(data, element);
    },
    async renderLabels(): Promise<void> {
      const element = this.$refs.labels as HTMLPreElement;
      const data = this.labels === null
        ? null
        : await this.labels.getAll();
      mount(data, element);
    },
    async renderSamples(): Promise<void> {
      const element = this.$refs.samples as HTMLPreElement;
      const data = this.queryUuids;
      mount(data, element);
    },
  },
});
</script>

<style>
.object-visualizer {
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
  padding: 10px;
  font-family: Menlo;
  font-size: 0.8rem;
  line-height: 1.4;
}

.array > .value,
.object > .value {
  display: flex;
  flex-direction: column;
  margin-left: 2rem;
}

.key {
  color: hsl(300, 60%, 65%);
}

.string > .value {
  color: hsl(15, 100%, 70%);
}

.boolean > .value,
.number > .value {
  color: hsl(250, 70%, 65%);
}

.null > .value,
.undefined > .value {
  color: hsl(0, 0%, 40%);
}

.separator {
  font-size: 0.8rem;
  color: hsl(0, 0%, 50%);
}

.array > .separator,
.object > .separator {
  cursor: pointer;
}

.indicator {
  cursor: pointer;
  font-size: 0.8rem;
  padding-right: 0.3rem;
  user-select: none;
  vertical-align: text-bottom;
  color: hsl(0, 0%, 50%);
}

.array > .key,
.object > .key {
  cursor: pointer;
}

.value > .array,
.value > .object {
  position: relative;
  left: -0.8rem;
}

.count,
.preview,
.quotes {
  font-size: 0.8rem;
  color: hsl(0, 0%, 50%);
}

.count,
.preview {
  user-select: none;
  cursor: pointer;
}
</style>
