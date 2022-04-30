<template>
  <i
    :aria-hidden="!hasClickListener"
    class="base-icon"
    :class="{ [icon]: isIconRegistered }"
    :style="{
      ...(fontSize ? {
        fontSize,
        height: fontSize,
        width: fontSize,
      } : undefined),
    }"
  >
    <slot v-if="!isIconRegistered" />
  </i>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import type { PropType } from '@vue/composition-api';

enum SizeType {
  xSmall = 'xSmall',
  small = 'small',
  default = 'default',
  large = 'large',
  xLarge = 'xLarge',
}

const SizeMap: Record<SizeType, string> = {
  [SizeType.xSmall]: '12px',
  [SizeType.small]: '16px',
  [SizeType.default]: '24px',
  [SizeType.large]: '36px',
  [SizeType.xLarge]: '40px',
};

export default defineComponent({
  name: 'BaseIcon',
  props: {
    size: {
      type: String as PropType<string>,
      default: undefined,
    },
    xSmall: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    small: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    large: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    xLarge: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },
  computed: {
    icon(): string {
      const slot = this.$slots.default;
      if (slot) return slot[0].text?.trim() ?? '';
      return '';
    },
    isIconRegistered(): boolean {
      return Object.values(this.$vuetify.icons.values).includes(this.icon);
    },
    fontSize(): string {
      const sizes: Partial<Record<SizeType, boolean>> = {
        [SizeType.xSmall]: this.xSmall,
        [SizeType.small]: this.small,
        [SizeType.large]: this.large,
        [SizeType.xLarge]: this.xLarge,
      };
      const explicitSize = Object
        .entries(sizes).find(([, value]) => value) as [SizeType, boolean] | undefined;
      if (explicitSize !== undefined) return SizeMap[explicitSize[0]];
      if (this.size !== undefined) return this.size;
      return SizeMap[SizeType.default];
    },
    hasClickListener(): boolean {
      return Boolean(this.$listeners.click || this.$listeners['!click']);
    },
  },
});
</script>

<style scoped>
.base-icon {
  align-items: center;
  display: inline-flex;
  font-feature-settings: 'liga';
  font-size: 24px;
  justify-content: center;
  letter-spacing: normal;
  line-height: 1;
  position: relative;
  text-indent: 0;
  transition: .3s cubic-bezier(.25,.8,.5,1),visibility 0s;
  vertical-align: middle;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

</style>
