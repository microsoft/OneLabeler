<template>
  <v-card
    class="rounded-0"
    style="display: flex; flex-direction: row;"
  >
    <div style="flex: 1 1 100%; display: flex; flex-direction: column; width: 0;">
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
              class="mx-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.data
            </v-icon>
            Data Objects
          </div>
          <div
            v-if="maxVisible < nTotal"
            style="padding: 4px; padding-bottom: 0px;"
          >
            {{ nTotal }} data objects exist, only load first {{ maxVisible }}
          </div>
          <ObjectInspector
            :data="filteredDataObjects"
            :array-max-properties="5"
            theme="chromeLight"
            style="padding: 4px;"
          />
        </div>

        <div>
          <div class="view-header">
            <v-icon
              class="mx-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.features
            </v-icon>
            Features
          </div>
          <div
            v-if="maxVisible < nTotal"
            style="padding: 4px; padding-bottom: 0px;"
          >
            {{ nTotal }} data objects exist, only load the features of first {{ maxVisible }}
          </div>
          <ObjectInspector
            :data="filteredFeatures"
            :array-max-properties="5"
            theme="chromeLight"
            style="padding: 4px;"
          />
        </div>

        <div>
          <div class="view-header">
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

        <div>
          <div class="view-header">
            <v-icon
              class="mx-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.samples
            </v-icon>
            Samples
          </div>
          <ObjectInspector
            :data="queryUuids"
            :array-max-properties="5"
            theme="chromeLight"
            style="padding: 4px;"
          />
        </div>

        <div>
          <div class="view-header">
            <v-icon
              class="mx-2"
              aria-hidden="true"
              small
              width="18px"
            >
              $vuetify.icons.values.categories
            </v-icon>
            Categories
          </div>
          <ObjectInspector
            :data="categories"
            :array-max-properties="5"
            theme="chromeLight"
            style="padding: 4px;"
          />
        </div>

        <div>
          <div class="view-header">
            <v-icon
              class="mx-2"
              aria-hidden="true"
              small
            >
              $vuetify.icons.values.stoppage
            </v-icon>
            Stop
          </div>
          <ObjectInspector
            :data="stop"
            :array-max-properties="5"
            theme="chromeLight"
            style="padding: 4px;"
          />
        </div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref,
  toRefs,
  watch,
} from '@vue/composition-api';
import type { PropType, Ref } from '@vue/composition-api';
import ObjectInspector from 'vue-object-inspector';
import type {
  Category,
  IDataObjectStorage,
  ILabelStorage,
} from '@/commons/types';
import {
  useFilteredDataObjects,
  useFilteredLabels,
} from '@/components/composables/useFilteredStorage';

/**
 * @reference
 * 1. https://github.com/storybookjs/react-inspector
 * 2. https://github.com/vikyd/vue-object-inspector
 */

const useNTotal = (dataObjects: Ref<IDataObjectStorage | null>) => {
  const nTotal: Ref<number> = ref(0);
  const updateNLabeled = async (): Promise<void> => {
    if (dataObjects.value === null) nTotal.value = 0;
    else nTotal.value = await dataObjects.value.count();
  };
  onMounted(updateNLabeled);
  watch(dataObjects, updateNLabeled);
  return { nTotal };
};

export default defineComponent({
  name: 'BaseVariableInspector',
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
    queryUuids: {
      type: Array as PropType<string[]>,
      required: true,
    },
    categories: {
      type: Array as PropType<Category[]>,
      required: true,
    },
    stop: {
      type: Boolean as PropType<boolean>,
      required: true,
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
      ...useFilteredDataObjects(dataObjects, scopeUuids),
      ...useFilteredLabels(dataObjects, labels, scopeUuids, showEditedLabels),
      ...useNTotal(dataObjects),
      showEditedLabels,
    };
  },
  computed: {
    maxVisible(): number {
      const { scopeUuids } = this;
      return scopeUuids === null ? Infinity : scopeUuids.length;
    },
    filteredFeatures(): number[][] | null {
      const { filteredDataObjects } = this;
      const featuresComputed = filteredDataObjects.length >= 1
        && filteredDataObjects[0].features !== undefined
        && filteredDataObjects[0].features !== null;
      return featuresComputed
        ? filteredDataObjects.map((d) => d.features as number[])
        : null;
    },
  },
});
</script>
