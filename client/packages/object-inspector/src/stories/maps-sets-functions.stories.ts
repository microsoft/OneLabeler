import { storiesOf } from '@storybook/vue';
import VObjectInspector from '../index';

storiesOf('Maps', module)
  .add('Map: Empty Map', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="1" :data="new Map()"/>',
  }))
  .add('Map: Boolean keys', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Map([[true, `one`], [false, `two`]])"/>',
  }))
  .add('Map: Regex keys', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Map([[/S/g, `one`], [/D/g, `two`]])"/>',
  }))
  .add('Map: String keys', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Map([[`one`, 1], [`two`, 2]])"/>',
  }))
  .add('Map: Object keys', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Map([[{}, 1], [{ key: 2 }, 2]])"/>',
  }))
  .add('Map: Array keys', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Map([[[1], 1], [[2], 2]])"/>',
  }))
  .add('Map: Map keys', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Map([[new Map(), 1], [new Map([]), 2]])"/>',
  }));

storiesOf('Sets', module)
  .add('Set: Empty Set', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="new Set()"/>',
  }))
  .add('Set: Simple Set', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="1" :data="new Set([1, 2, 3, 4])"/>',
  }))
  .add('Set: Nested Set', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="2" :data="new Set([1, 2, 3, new Set([1, 2])])"/>',
  }));

storiesOf('Functions', module)
  .add('Functions: anonymous function', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="function () {}"/>',
  }))
  .add('Functions: anonymous arrow function', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="() => {}"/>',
  }))
  .add('Functions: named function', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="data"/>',
    data() {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        data: function namedFunction() {},
      };
    },
  }))
  .add('Functions: named function (show non-enumerable properties)', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="1" :data="data"/>',
    data() {
      return {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        data: function namedFunction() {},
      };
    },
  }));
