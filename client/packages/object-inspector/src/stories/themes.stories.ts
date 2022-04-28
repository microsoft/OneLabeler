import { storiesOf } from '@storybook/vue';
import VObjectInspector from '../index';

const data = { a: 1, b: 'abc', c: [1, 2, 3] };

storiesOf('Themes', module)
  .add('chromeLight', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector :data="data"/>',
    data() {
      return { data };
    },
  }))
  .add('chromeDark', () => ({
    components: { VObjectInspector },
    template: '<VObjectInspector theme="chromeDark" :expandLevel="3" :data="data"/>',
    data() {
      return { data };
    },
  }));
