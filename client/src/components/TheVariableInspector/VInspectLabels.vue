<template>
  <div>
    <div :style="style.cardHeader">
      <v-icon
        class="mx-2"
        aria-hidden="true"
        small
      >
        $vuetify.icons.values.labels
      </v-icon>
      Labels
      <v-spacer />
      <div
        class="px-2"
        style="display: flex; flex-direction: row; align-items: center;"
      >
        all
        <v-switch
          v-model="showEditedLabels"
          class="pa-0 pl-2 ma-0"
          :ripple="false"
          dense
          hide-details=""
        />
        edited
      </div>
    </div>
    <div
      v-if="maxVisible < nTotal"
      class="subtitle-2"
      style="padding: 4px; padding-bottom: 0px;"
    >
      {{ nTotal }} labels exist, only load first {{ maxVisible }}
    </div>
    <ObjectInspector
      :data="filteredLabels"
      :array-max-properties="5"
      theme="chromeLight"
      style="padding: 4px;"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  toRefs,
} from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import ObjectInspector from 'vue-object-inspector';
import type { IDataObjectStorage, ILabelStorage } from '@/commons/types';
import { useFilteredLabels } from '@/components/composables/useFilteredStorage';
import { cardHeader } from '@/style';
import useNTotal from './utils/useNTotal';

export default defineComponent({
  name: 'VInspectLabels',
  components: { ObjectInspector },
  props: {
    dataObjects: {
      type: Object as PropType<IDataObjectStorage | null>,
      default: null,
    },
    labels: {
      type: Object as PropType<ILabelStorage | null>,
      default: null,
    },
    scopeUuids: {
      type: Array as PropType<string[] | null>,
      default: null,
    },
  },
  setup(props) {
    const {
      dataObjects,
      labels,
      scopeUuids,
    } = toRefs(props);
    const showEditedLabels = ref(true);
    return {
      ...useFilteredLabels(dataObjects, labels, scopeUuids, showEditedLabels),
      ...useNTotal(dataObjects),
      showEditedLabels,
    };
  },
  data() {
    return { style: { cardHeader } };
  },
  computed: {
    maxVisible(): number {
      const { scopeUuids } = this;
      return scopeUuids === null ? Infinity : scopeUuids.length;
    },
  },
});
</script>