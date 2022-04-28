import { storiesOf } from '@storybook/vue';
import VObjectInspector from '../index';

storiesOf('Numbers', module)
  .add('positive', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="42"/>',
  }))
  .add('zero', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="0"/>',
  }))
  .add('negative', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="-1"/>',
  }))
  .add('float', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="1.5"/>',
  }))
  .add('exponential', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="1e100"/>',
  }))
  .add('NaN', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="NaN"/>',
  }))
  .add('Infinity', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="Infinity"/>',
  }));

storiesOf('BigInts', module)
  .add('positive', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="42n"/>',
  }))
  .add('zero', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="0n"/>',
  }))
  .add('negative', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="-1n"/>',
  }));

storiesOf('Strings', module)
  .add('empty string', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="``"/>',
  }))
  .add('simple', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="`hello`"/>',
  }));

storiesOf('Booleans', module)
  .add('true', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="true"/>',
  }))
  .add('false', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="false"/>',
  }));

storiesOf('Undefined', module)
  .add('undefined', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="undefined"/>',
  }));

storiesOf('Null', module)
  .add('null', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="null"/>',
  }));

storiesOf('Symbols', module)
  .add('test', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="data"/>',
    data() {
      return { data: Symbol.for('test') };
    },
  }));
