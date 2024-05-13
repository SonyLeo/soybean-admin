<script setup lang="tsx">
import { NButton, NPopconfirm } from 'naive-ui';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { isNull } from 'lodash-es';
import { fetchDelUser, fetchGenCode, fetchGenTableList } from '@/service/api';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import TableSearch from './module/table-search.vue';
import TablePreview from './module/table-preview.vue';

const appStore = useAppStore();
const router = useRouter();

const { columns, columnChecks, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchGenTableList,
  apiParams: {
    current: 1,
    size: 10,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    tableName: '',
    tableComment: '',
    dateRange: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
    },
    {
      key: 'id',
      title: '序号',
      align: 'center',
      width: 100
    },
    {
      key: 'dataName',
      title: '数据源',
      align: 'center',
      width: 50
    },
    {
      key: 'tableName',
      title: '表名称',
      align: 'center',
      width: 150
    },
    {
      key: 'tableComment',
      title: '表描述',
      align: 'center',
      width: 80
    },
    {
      key: 'className',
      title: '实体',
      align: 'center',
      width: 150
    },
    {
      key: 'createTime',
      title: '创建时间',
      align: 'center',
      width: 150
    },
    {
      key: 'updateTime',
      title: '更新时间',
      align: 'center',
      width: 150
    },
    {
      key: 'operate',
      title: $t('common.operate'),
      align: 'center',
      width: 130,
      render: row => (
        <div class="flex-center gap-8px">
          <NButton type="primary" ghost size="small" onClick={() => preview(row.id)}>
            预览
          </NButton>
          <NButton type="primary" ghost size="small" onClick={() => edit(row.id)}>
            {$t('common.edit')}
          </NButton>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <NButton type="error" ghost size="small">
                  {$t('common.delete')}
                </NButton>
              )
            }}
          </NPopconfirm>
        </div>
      )
    }
  ],
  showTotal: true
});

const {
  checkedRowKeys,
  onBatchDeleted,
  onDeleted
  // closeDrawer
} = useTableOperate(data, getData);

async function handleBatchDelete() {
  if (checkedRowKeys.value.length > 0) {
    await fetchDelUser(checkedRowKeys.value);

    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  await fetchDelUser(id);

  onDeleted();
}

async function edit(id: number) {
  router.push({ name: 'tool_generate-edit', params: { id } });
}

const genCodeList = ref<Record<string, string>>({});

async function getGenCodeById(id: number) {
  const { data: codeList } = await fetchGenCode(id);
  if (!isNull(codeList)) {
    genCodeList.value = codeList;
  }
}

const isShowRef = ref<boolean>(false);
function preview(id: number) {
  getGenCodeById(id);
  isShowRef.value = true;
}

function handleUpdateVisible(visible: boolean) {
  isShowRef.value = visible;
}
</script>

<template>
  <div class="min-h-1500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TableSearch v-model:model="searchParams" :has-add="false" @reset="resetSearchParams" @search="getData" />
    <NCard :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header>
        <NSpace class="lt-sm:w-200px" justify="start">
          <NButton size="small" ghost type="tertiary">
            <template #icon>
              <icon-fluent-mdl2:generate class="text-icon" />
            </template>
            生成
          </NButton>
          <NButton size="small" ghost type="tertiary">
            <template #icon>
              <icon-iconoir:database-export class="text-icon" />
            </template>
            导入
          </NButton>
        </NSpace>
      </template>
      <template #header-extra>
        <TableHeaderOperation
          v-model:columns="columnChecks"
          :disabled-delete="checkedRowKeys.length === 0"
          :loading="loading"
          :has-add="false"
          @delete="handleBatchDelete"
          @refresh="getData"
        />
      </template>
      <NDataTable
        v-model:checked-row-keys="checkedRowKeys"
        :columns="columns"
        :data="data"
        size="small"
        :flex-height="!appStore.isMobile"
        :scroll-x="962"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
    <TablePreview :is-show="isShowRef" :gen-code-list="genCodeList" @update-visible="handleUpdateVisible" />
  </div>
</template>

<style scoped></style>
