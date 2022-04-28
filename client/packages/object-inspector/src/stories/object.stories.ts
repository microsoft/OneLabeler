import { storiesOf } from '@storybook/vue';
import VObjectInspector from '../index';

storiesOf('Nested object examples', module)
  .add('Ice sculpture', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="2" :data="data"/>',
    data() {
      return {
        data: {
          id: 2,
          name: 'An ice sculpture',
          // "price": 12.50,
          tags: ['cold', 'ice'],
          dimensions: {
            length: 7.0,
            width: 12.0,
            height: 9.5,
          },
          warehouseLocation: {
            latitude: -78.75,
            longitude: 20.4,
          },
        },
      };
    },
  }))
  .add('Glossary', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="7" :data="data"/>',
    data() {
      return {
        data: {
          glossary: {
            title: 'example glossary',
            GlossDiv: {
              title: 'S',
              GlossList: {
                GlossEntry: {
                  ID: 'SGML',
                  SortAs: 'SGML',
                  GlossTerm: 'Standard Generalized Markup Language',
                  Acronym: 'SGML',
                  Abbrev: 'ISO 8879:1986',
                  GlossDef: {
                    para:
                      'A meta-markup language, used to create markup languages such as DocBook.',
                    GlossSeeAlso: ['GML', 'XML'],
                  },
                  GlossSee: 'markup',
                },
              },
            },
          },
        },
      };
    },
  }))
  .add('Contrived example', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="3" :data="data"/>',
    data() {
      return {
        data: {
          a1: 1,
          a2: 'A2',
          a3: true,
          a4: undefined,
          a5: {
            'a5-1': null,
            'a5-2': ['a5-2-1', 'a5-2-2'],
            'a5-3': {},
          },
          a6() {
            // eslint-disable-next-line
            console.log('hello world')
          },
          a7: new Date('2005-04-03'),
        },
      };
    },
  }));

storiesOf('Objects', module)
  .add('Object: Date', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="new Date(`2005-04-03`)"/>',
  }))
  .add('Object: Regular Expression', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="/^.*$/"/>',
  }))
  .add('Object: Empty Object', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="1"  :data="{}"/>',
  }))
  .add('Object: Empty String key', () => ({
    components: { VObjectInspector },
    // eslint-disable-next-line quotes
    template: `<VObjectInspector :data="{'': 'hi'}"/>`,
  }))
  .add('Object: Object with getter property', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector :expandLevel="2":data="{ get prop() { return `v` } }"/>',
  }))
  .add('Object: Object with getter property that throws', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :expandLevel="2" :data="data"/>',
    data() {
      // TODO: this example will not working now
      return {
        data: {
          get prop() {
            throw new Error();
          },
        },
      };
    },
  }))
  .add('Object: Simple Object', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="2" :data="{ k: `v` }"/>',
  }))
  .add('Object: inherited object', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="2" :data="Object.create({ k: `v` })"/>',
  }))
  .add('Object: `Object`', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="1" :data="Object"/>',
  }))
  .add('Object: `Object.prototype`', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="1" :data="Object.prototype"/>',
  }))
  .add('Object: Simple Object with name', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="2" name="test" :data="{k: `v`}"/>',
  }))
  .add(
    'Object: `Object.create(null) (Empty object with null prototype)`',
    () => ({
      components: { VObjectInspector },
      template:
        '<VObjectInspector showNonEnumerable :expandLevel="1" :data="Object.create(null)"/>',
    }),
  )
  .add('Object: Object with null prototype', () => ({
    components: { VObjectInspector },
    template:
      '<VObjectInspector showNonEnumerable :expandLevel="1" :data="Object.assign(Object.create(null), { key: `value` })"/>',
  }));
