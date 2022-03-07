import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import TheNavBarView from '@/components/TheNavBarView/TheNavBarView.vue';

describe('TheNavBarView.vue', () => {
  it('has height = props.height when passed', () => {
    const height = 50;
    const wrapper = shallowMount(TheNavBarView, {
      propsData: { height },
    });
    expect(wrapper).to.has.property('height', height);
  });
});
