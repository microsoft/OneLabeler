import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import TheNavBar from '@/components/TheNavBar.vue';

describe('TheNavBar.vue', () => {
  it('has height = props.height when passed', () => {
    const height = 50;
    const wrapper = shallowMount(TheNavBar, {
      propsData: { height },
    });
    expect(wrapper).to.has.property('height', height);
  });
});
