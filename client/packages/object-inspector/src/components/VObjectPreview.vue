<template>
  <span>
    <VObjectValue
      v-if="type === Type.Simple"
      :object="object"
    />
    <span v-else-if="type === Type.Array">
      <span
        class="object-preview-desc"
      >{{ object.length === 0 ? '' : `(${object.length})\xa0` }}</span>
      <span class="object-preview">
        <span>[</span>
        <span
          v-for="(item, index) of previewArray"
          :key="index"
        >
          <span v-if="index != 0">, </span>
          <VObjectValue :object="item" />
          <span v-if="index === arrayMaxProperties - 1">, </span>
          <span v-if="index === arrayMaxProperties - 1">…</span>
        </span>
        <span>]</span>
      </span>
    </span>
    <span v-else-if="type === Type.Other">
      <span class="object-preview-desc">{{ className }}</span>
      <span class="object-preview">
        <span>{</span>
        <span
          v-for="(item, index) of previewObjectItems"
          :key="index"
        >
          <span v-if="index != 0">, </span>
          <span class="object-name">{{ item.key || '""' }}</span>
          :&nbsp;
          <VObjectValue :object="item.val" />
          <span v-if="index === objectMaxProperties - 1">…</span>
        </span>
        <span>}</span>
      </span>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import VObjectValue from './VObjectValue.vue';

enum Type {
  Simple = 'Simple',
  Array = 'Array',
  Other = 'Other',
}

const getType = (object: unknown): Type => {
  if (
    typeof object !== 'object'
    || object === null
    || object instanceof Date
    || object instanceof RegExp
  ) return Type.Simple;

  if (Array.isArray(object)) return Type.Array;

  return Type.Other;
};

export default defineComponent({
  name: 'VObjectPreview',
  components: { VObjectValue },
  // `provide` from top component `object-inspector`
  inject: [
    'objectMaxProperties',
    'arrayMaxProperties',
  ],
  props: {
    data: {
      // Any type.
      type: null,
      required: true,
    },
  },
  data() {
    return { Type };
  },
  computed: {
    object(): unknown {
      return this.data;
    },
    type(): Type {
      return getType(this.object);
    },
    /** The name of object constructor. */
    className(): string {
      const { object } = this;
      if (typeof object !== 'object' || object === null) return '';
      const { constructor } = object;
      const constructorName = constructor ? constructor.name : 'Object';
      return constructorName === 'Object' ? '' : `${constructorName} `;
    },
    /**
     * A slice of the object (which is an array) for preview.
     * If the object is not array, returns empty array.
     */
    previewArray(): unknown[] {
      const { object } = this;
      if (!Array.isArray(object)) return [];
      const arrayMaxProperties = this.arrayMaxProperties as number;
      return object.slice(0, arrayMaxProperties);
    },
    /**
     * A slice of the object (which is an object) for preview.
     * If the object is not object, returns empty object.
     */
    previewObjectItems(): object {
      const { object } = this;
      if (typeof object !== 'object' || object === null) return {};
      const objectMaxProperties = this.objectMaxProperties as number;
      let keys = Object.keys(object);
      if (keys.length > objectMaxProperties) {
        keys = keys.slice(0, objectMaxProperties);
      }
      return keys.map((k) => ({
        key: k,
        val: (object as Record<string, unknown>)[k],
      }));
    },
  },
});
</script>
