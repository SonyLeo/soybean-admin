import { mount } from '@vue/test-utils';
import { NConfigProvider } from 'naive-ui';
import { defineComponent, nextTick } from 'vue';
import { getLocale, setLocale } from '@/locales';
import DevTableColumnStatePage from './index.vue';

function mountPage() {
  const Root = defineComponent({
    components: {
      DevTableColumnStatePage,
      NConfigProvider
    },
    template: `
      <NConfigProvider>
        <DevTableColumnStatePage />
      </NConfigProvider>
    `
  });

  return mount(Root);
}

describe('dev table column state page', () => {
  afterEach(() => {
    setLocale('zh-CN');
  });

  it('renders the smoke page and column setting trigger', () => {
    setLocale('en-US');

    const wrapper = mountPage();

    expect(wrapper.find('[data-testid="table-column-state-page"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Table Column State Test');
    expect(wrapper.text()).toContain('Column Setting');
    expect(wrapper.get('[data-testid="current-locale"]').text()).toBe('en-US');
  });

  it('switches locale from the page controls', async () => {
    setLocale('en-US');

    const wrapper = mountPage();

    await wrapper.get('[data-testid="switch-locale-zh"]').trigger('click');
    await nextTick();

    expect(getLocale()).toBe('zh-CN');
    expect(wrapper.get('[data-testid="current-locale"]').text()).toBe('zh-CN');
    expect(wrapper.text()).toContain('列设置');
  });
});
