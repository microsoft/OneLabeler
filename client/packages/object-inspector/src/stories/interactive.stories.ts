import { storiesOf } from '@storybook/vue';
import VInteractive from './VInteractive.vue';

storiesOf('Interactive', module)
  .add('Interactive Example', () => ({
    components: { VInteractive },
    template: '<VInteractive />',
  }));
