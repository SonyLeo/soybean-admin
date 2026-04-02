<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TableColumnCheck } from '@sa/hooks';
import { getLocale, setLocale } from '@/locales';

defineOptions({
  name: 'DevTableColumnStatePage'
});

interface RowData {
  id: number;
  name: string;
  role: string;
  status: string;
}

const rows: RowData[] = [
  { id: 1001, name: 'Ada', role: 'Admin', status: 'Enabled' },
  { id: 1002, name: 'Linus', role: 'Maintainer', status: 'Reviewing' },
  { id: 1003, name: 'Grace', role: 'Tester', status: 'Disabled' }
];

const locale = computed(() => getLocale());

function getColumnTitleMap() {
  if (locale.value === 'zh-CN') {
    return {
      name: '姓名',
      role: '角色',
      status: '状态'
    };
  }

  return {
    name: 'Name',
    role: 'Role',
    status: 'Status'
  };
}

function createDefaultColumnChecks(): TableColumnCheck[] {
  const titleMap = getColumnTitleMap();

  return [
    { key: 'name', title: titleMap.name, checked: true, visible: true, fixed: 'left' },
    { key: 'role', title: titleMap.role, checked: true, visible: true, fixed: 'unFixed' },
    { key: 'status', title: titleMap.status, checked: true, visible: true, fixed: 'unFixed' }
  ];
}

const columnChecks = ref<TableColumnCheck[]>(createDefaultColumnChecks());

const dataColumns = computed<NaiveUI.TableColumn<RowData>[]>(() => {
  const titleMap = getColumnTitleMap();

  const columnMap = new Map<string, NaiveUI.TableColumn<RowData>>([
    [
      'name',
      {
        key: 'name',
        title: titleMap.name,
        width: 180,
        fixed: 'left'
      }
    ],
    [
      'role',
      {
        key: 'role',
        title: titleMap.role,
        width: 180
      }
    ],
    [
      'status',
      {
        key: 'status',
        title: titleMap.status,
        width: 180
      }
    ]
  ]);

  return columnChecks.value
    .filter(column => column.checked)
    .map(column => {
      const tableColumn = columnMap.get(column.key);

      return {
        ...tableColumn,
        fixed: column.fixed === 'unFixed' ? undefined : column.fixed
      } as NaiveUI.TableColumn<RowData>;
    });
});

watch(locale, () => {
  const currentOrder = new Map(columnChecks.value.map((column, index) => [column.key, { column, index }]));
  const nextColumns = createDefaultColumnChecks();

  columnChecks.value = nextColumns
    .map((column, defaultIndex) => {
      const current = currentOrder.get(column.key);

      return {
        index: current?.index ?? Number.MAX_SAFE_INTEGER + defaultIndex,
        value: current
          ? {
              ...column,
              checked: current.column.checked,
              fixed: current.column.fixed
            }
          : column
      };
    })
    .sort((left, right) => left.index - right.index)
    .map(item => item.value);
});

function switchLocale(lang: App.I18n.LangType) {
  setLocale(lang);
}
</script>

<template>
  <div class="min-h-screen bg-layout px-24px py-20px" data-testid="table-column-state-page">
    <NCard title="Table Column State Test" :bordered="false">
      <template #header-extra>
        <NSpace align="center">
          <NTag data-testid="current-locale" type="info">{{ locale }}</NTag>
          <NButton size="small" data-testid="switch-locale-zh" @click="switchLocale('zh-CN')">ZH</NButton>
          <NButton size="small" data-testid="switch-locale-en" @click="switchLocale('en-US')">EN</NButton>
          <TableColumnSetting v-model:columns="columnChecks" />
        </NSpace>
      </template>
      <NSpace vertical :size="16">
        <NAlert type="info" :show-icon="false">
          This page is only used for smoke and regression tests of table column state features.
        </NAlert>
        <div data-testid="table-column-state-table">
          <NDataTable :columns="dataColumns" :data="rows" :bordered="false" :pagination="false" />
        </div>
      </NSpace>
    </NCard>
  </div>
</template>

<style scoped></style>
