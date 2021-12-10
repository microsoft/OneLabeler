<template>
  <div
    :style="{
      color: {
        'Success': '#5aaf4b',
        'Warning': '#fb8c00',
        'Error': '#f5504e',
      }[message.type],
      'background-color': {
        'Success': '#ebf6ea',
        'Warning': '#fef1e0',
        'Error': '#fdebeb',
      }[message.type],
      cursor: !isSubjectEmpty ? 'pointer' : undefined,
    }"
    class="px-2 shadow"
  >
    <v-icon
      aria-hidden="true"
      :color="{
        'Success': '#5aaf4b',
        'Warning': '#fb8c00',
        'Error': '#f5504e',
      }[message.type]"
      class="pr-1"
      small
    >
      {{ {
        'Success': $vuetify.icons.values.success,
        'Warning': $vuetify.icons.values.warning,
        'Error': $vuetify.icons.values.error,
      }[message.type] }}
    </v-icon>
    <span
      v-if="shouldShowArrow"
      :class="expanded ? 'tree-node-arrow-expanded' : 'tree-node-arrow-collapsed'"
      class="tree-node-arrow"
      style="cursor: pointer"
      @click="expanded = !expanded"
    >
      ▶
    </span>
    {{ message.message }}
    <p
      v-if="expanded"
      style="margin: 0 !important"
    >
      <b>Violated Rule</b>:
      {{ message.rule }}
    </p>
    <p
      v-if="expanded"
      style="margin: 0 !important"
    >
      <b>Recommendation</b>:
      <template v-if="message.fixes.length === 1">
        {{ message.fixes[0] }}
      </template>
      <ul v-else-if="message.fixes.length >= 2">
        <li
          v-for="(fix, i) in message.fixes"
          :key="i"
        >
          {{ fix }}
        </li>
      </ul>
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';
import { LintMessageType } from '@/commons/workflow-utils/lint-workflow';
import type { LintMessage } from '@/commons/workflow-utils/lint-workflow';

export default defineComponent({
  name: 'VMessage',
  props: {
    message: {
      type: Object as PropType<LintMessage>,
      required: true,
    },
  },
  data() {
    return { expanded: false };
  },
  computed: {
    isSubjectEmpty(): boolean {
      const { subjects } = this.message;
      return subjects === null || subjects === undefined || subjects.length === 0;
    },
    shouldShowArrow(): boolean {
      const { type } = this.message;
      return type !== LintMessageType.Success;
    },
  },
});
</script>

<style lang="scss" scoped>
.shadow:hover {
  -moz-box-shadow: inset 0px 0px 5px #aaa;
  -webkit-box-shadow: inset 0px 0px 5px #aaa;
  box-shadow: inset 0px 0px 5px #aaa;
}

.tree-node-arrow {
  color: #6e6e6e;
  display: inline-block;
  font-size: 12px;
  margin-right: 3px;
}

.tree-node-arrow-expanded {
  transform: rotate(90deg);
}

.tree-node-arrow-collapsed {
  transform: rotate(0deg);
}
</style>