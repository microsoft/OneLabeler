<template>
  <div id="app">
    <div class="tips">
      <p>More examples: run storybook locally, see README.md</p>
      <button @click="onClickExpand">
        Expand All
      </button>
      <button @click="onClickFold">
        Collapse All
      </button>
      <button @click="onClickPaths">
        Expand to path
      </button>
    </div>
    <VObjectInspector
      :data="data"
      :expand-level="expandLevel"
      :expand-paths="expandPaths"
      class="content"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import VObjectInspector from '../index';

export default defineComponent({
  name: 'VInteractive',
  components: { VObjectInspector },
  data() {
    return {
      expandLevel: 1,
      expandPaths: ['*.a'],
      dataArr: [
        1,
        2,
        [1, { a: 1, b: 2 }, 3],
        { a: 123, b: 'abc' },
        'my-string',
        null,
        undefined,
        Symbol('test'),
        5,
        6,
        7,
        8,
        9,
        10,
        11,
      ],
      data: {
        number: 123,
        string: 'abc',
        multiLine: '123\n456',
        boolean: true,
        arr: [1, 2, 3, 4, 5],
        undef: undefined,
        nul: null,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        funcArrow: () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        func: function f1() {},
        a: {
          symbolVal: Symbol('aaa'),
          number: 123,
          string: 'abc',
          boolean: true,
          undef: undefined,
          nul: null,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          funcArrow: () => {},
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          func: function f1() {},
          arr: [1, 2, 3, 4, 5],
          objEmpty: {},
        },
        b: 2,
        c: [1, 2, 3],
        // x0: console,
        // w: window,
      },
    };
  },
  methods: {
    onClickExpand(): void {
      this.expandLevel = 5;
    },
    onClickFold(): void {
      this.expandLevel = -1;
      this.$nextTick(() => {
        this.expandLevel = 0;
      });
    },
    onClickPaths(): void {
      this.expandPaths = ['$.a.arr'];
    },
  },
});
</script>

<style lang="css" scoped>
#app {
  margin: 30px auto;
  width: 1000px;
}

.content {
  padding: 15px;
  border: 1px solid #eee;
}

.tips {
  color: red;
}
</style>
