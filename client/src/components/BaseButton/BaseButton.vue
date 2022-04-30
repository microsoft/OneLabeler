<template>
  <component
    :is="component"
    :href="href"
    :target="target"
    class="base-button"
    style="text-decoration: none;"
    :style="{
      ...(buttonSize ? {
        height: buttonSize,
        [icon ? 'width' : 'min-width']: buttonSize,
      } : undefined),
    }"
    v-on="$listeners"
  >
    <span class="base-btn__content">
      <slot />
    </span>
  </component>
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

const ButtonSizeMap: Record<SizeType, string> = {
  [SizeType.xSmall]: '20px',
  [SizeType.small]: '28px',
  [SizeType.default]: '36px',
  [SizeType.large]: '44px',
  [SizeType.xLarge]: '52px',
};

export default defineComponent({
  name: 'BaseButton',
  props: {
    icon: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
    href: {
      type: String as PropType<string>,
      default: undefined,
    },
    target: {
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
    component(): 'a' | 'button' {
      return this.href !== undefined ? 'a' : 'button';
    },
    buttonSize(): string | undefined {
      const sizes: Partial<Record<SizeType, boolean>> = {
        [SizeType.xSmall]: this.xSmall,
        [SizeType.small]: this.small,
        [SizeType.large]: this.large,
        [SizeType.xLarge]: this.xLarge,
      };
      const explicitSize = Object
        .entries(sizes).find(([, value]) => value) as [SizeType, boolean] | undefined;
      return explicitSize !== undefined
        ? ButtonSizeMap[explicitSize[0]]
        : ButtonSizeMap[SizeType.default];
    },
  },
});
</script>

<style scoped>
.base-button {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  justify-content: center;
  outline: 0;
  position: relative;
  text-decoration: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;
}
.base-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
.base-button:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.base-btn__content {
  align-items: center;
  color: inherit;
  display: flex;
  flex: 1 0 auto;
  justify-content: inherit;
  line-height: normal;
  position: relative;
  transition: inherit;
  transition-property: opacity;
}
</style>
