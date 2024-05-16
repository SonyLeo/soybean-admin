<script setup lang="tsx">
import { NButton, NPopconfirm } from 'naive-ui';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { isNull, isUndefined } from 'lodash-es';
import { fetchDelUser, fetchDownloadCode, fetchDownloadCodeZip, fetchGenCode, fetchGenTableList } from '@/service/api';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import TableSearch from './module/table-search.vue';
import TablePreview from './module/table-preview.vue';
import TableImport from './module/table-import.vue';

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
          <NButton type="primary" ghost size="small" onClick={() => download(row.id, row.genType)}>
            {$t('common.download')}
          </NButton>
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

const genCodeList = ref<Record<string, string>>({});

async function getGenCodeById(id: number) {
  const { data: codeList } = await fetchGenCode(id);
  if (!isNull(codeList)) {
    genCodeList.value = codeList;
  }
}

const showPreview = ref<boolean>(false);
function preview(id: number) {
  showPreview.value = true;
  getGenCodeById(id);
}

async function edit(id: number) {
  router.push({ name: 'tool_generate-edit', params: { id } });
}

async function download(id?: number, genType?: Api.Common.GenType) {
  const tableIds = id || checkedRowKeys.value.join(',');
  if (!isUndefined(id) && !isUndefined(genType)) {
    if (genType === '1') {
      await fetchDownloadCode(id);
    } else {
      fetchDownloadCodeZip(tableIds);
    }
    return;
  }

  if (checkedRowKeys.value.length === 0) {
    window.$message?.warning?.('请选择要生成的数据');
    return;
  }
  fetchDownloadCodeZip(tableIds);
}

const showImport = ref<boolean>(false);
function importTable() {
  showImport.value = true;
}
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TableSearch v-model:model="searchParams" :has-add="false" @reset="resetSearchParams" @search="getData" />
    <NCard :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header>
        <NSpace class="lt-sm:w-200px" justify="start">
          <NButton size="small" ghost type="tertiary" @click="download()">
            <template #icon>
              <icon-fluent-mdl2:generate class="text-icon" />
            </template>
            生成
          </NButton>
          <NButton size="small" ghost type="tertiary" @click="importTable">
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
    <TablePreview v-model="showPreview" :gen-code-list="genCodeList" />
    <TableImport v-model="showImport" />
  </div>
</template>

<style scoped></style>
