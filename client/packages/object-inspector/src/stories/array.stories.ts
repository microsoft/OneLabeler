import { storiesOf } from '@storybook/vue';
import VObjectInspector from '../index';

storiesOf('Arrays', module)
  .add('Empty Array', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="[]"/>',
  }))
  .add('Empty Array (show non-enumerable properties)', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="1" :data="[]"/>',
  }))
  .add('Basic Array', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="1" :data="[`cold`, `ice`]"/>',
  }))
  .add('Array with different types of elements', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="1" :data="[`a`, 1, {}]"/>',
  }))
  .add('Long Array', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="data"/>',
    data() {
      return { data: new Array(1000).fill(0).map((x, i) => `${i}`) };
    },
  }))
  .add('Array with big objects', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="data"/>',
    data() {
      return {
        data: new Array(100).fill(0).map((x, i) => ({
          key: i,
          name: `John #${i}`,
          dateOfBirth: new Date(i * 10e8),
          address: `${i} Main Street`,
          zip: 90210 + i,
        })),
      };
    },
  }))
  .add('Uint32Array', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="data"/>',
    data() {
      return { data: new Uint32Array(1000) };
    },
  }));
