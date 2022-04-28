<template>
  <span
    :class="info.class"
    :title="info.title"
  >
    <span>{{ info.title }}</span>
    <template v-if="type === 'function'">
      <span class="object-value-function-prefix">ƒ&nbsp;</span>
      <span class="object-value-function-name">{{ object.name }}()</span>
    </template>
  </span>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

type ObjectInfo = {
  class: string;
  title: string;
}

const getInfo = (object: unknown): ObjectInfo => {
  const type = typeof object;
  if (type === 'bigint') {
    return {
      class: 'object-value-number',
      title: `${object}n`,
    };
  }
  if (type === 'number') {
    return {
      class: 'object-value-number',
      title: `${object}`,
    };
  }
  if (type === 'string') {
    return {
      class: 'object-value-string',
      title: `"${object}"`,
    };
  }
  if (type === 'boolean') {
    return {
      class: 'object-value-boolean',
      title: `${object}`,
    };
  }
  if (type === 'undefined') {
    return {
      class: 'object-value-undefined',
      title: 'undefined',
    };
  }
  if (type === 'object') {
    if (object === null) {
      return {
        class: 'object-value-null',
        title: 'null',
      };
    }
    if (object instanceof Date) {
      return {
        class: '',
        title: object.toString(),
      };
    }
    if (object instanceof RegExp) {
      return {
        class: 'object-value-regexp',
        title: object.toString(),
      };
    }
    if (Array.isArray(object)) {
      return {
        class: '',
        title: `Array(${object.length})`,
      };
    }
    if (!(object as object).constructor) {
      return {
        class: '',
        title: 'Object',
      };
    }
    if (Buffer.isBuffer(object as object)) {
      return {
        class: '',
        title: `Buffer[${(object as object).constructor.name}]`,
      };
    }
    return {
      class: '',
      title: (object as object).constructor.name,
    };
  }
  if (type === 'function') {
    return {
      class: '',
      title: '',
    };
  }
  if (type === 'symbol') {
    return {
      class: 'object-value-symbol',
      title: (object as symbol).toString(),
    };
  }
  return {
    class: '',
    title: '',
  };
};

export default defineComponent({
  name: 'VObjectValue',
  props: {
    /** The JavaScript variable to inspect. */
    object: {
      // Any type.
      type: null,
      required: true,
    },
  },
  computed: {
    type(): string {
      return typeof this.object;
    },
    info(): ObjectInfo {
      return getInfo(this.object);
    },
  },
});
</script>
