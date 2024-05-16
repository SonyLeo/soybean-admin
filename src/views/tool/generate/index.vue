<script setup lang="tsx">
import { NButton, NPopconfirm } from 'naive-ui';
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { isNull, isUndefined } from 'lodash-es';
import {
  fetchDelGenTable,
  fetchDownloadCode,
  fetchDownloadCodeZip,
  fetchGenCode,
  fetchGenTableList,
  fetchSyncGenTable
} from '@/service/api';
import { $t } from '@/locales';
import { useAppStore } from '@/store/modules/app';
import { useTable, useTableOperate } from '@/hooks/common/table';
import { addDateRange } from '@/utils/common';
import ButtonIcon from '../../../components/custom/button-icon.vue';
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
    tableName: null,
    tableComment: null,
    dateRange: null
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
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
      width: 200,
      render: row => (
        <div class="flex-center gap-8px">
          <ButtonIcon tooltipContent="预览" tooltipPlacement="top">
            <icon-icon-park-outline-preview-open class="text-21px color-#646cff" onClick={() => preview(row.id)} />
          </ButtonIcon>
          <ButtonIcon tooltipContent="编辑" tooltipPlacement="top">
            <icon-icon-park-outline-edit-one class="text-21px color-#646cff" onClick={() => edit(row.id)} />
          </ButtonIcon>
          <NPopconfirm onPositiveClick={() => handleDelete(row.id)}>
            {{
              default: () => $t('common.confirmDelete'),
              trigger: () => (
                <div>
                  <ButtonIcon tooltipContent="删除" tooltipPlacement="top">
                    <icon-icon-park-outline-delete-five class="text-21px color-#f5222d" />
                  </ButtonIcon>
                </div>
              )
            }}
          </NPopconfirm>

          <NPopconfirm onPositiveClick={() => handleAsync(row.id)}>
            {{
              default: () => '确认同步数据库结构吗',
              trigger: () => (
                <div>
                  <ButtonIcon tooltipContent="数据库同步" tooltipPlacement="top">
                    <icon-icon-park-outline-database-sync class="text-21px color-#646cff" />
                  </ButtonIcon>
                </div>
              )
            }}
          </NPopconfirm>

          <ButtonIcon tooltipContent="下载" tooltipPlacement="top">
            <icon-icon-park-outline-code-download
              class="text-21px color-#646cff"
              onClick={() => download(row.id, row.genType)}
            />
          </ButtonIcon>
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
    const tableIds = checkedRowKeys.value.join(',');
    await fetchDelGenTable(tableIds);

    onBatchDeleted();
  }
}

async function handleDelete(id: number) {
  await fetchDelGenTable(id);

  onDeleted();
}

async function handleAsync(id: number) {
  await fetchSyncGenTable(id);

  window.$message?.success('同步成功');
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

function handleSearch() {
  const customQueryParams = addDateRange(searchParams, searchParams.dateRange);
  getData(customQueryParams);
}
</script>

<template>
  <div class="flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <TableSearch v-model:model="searchParams" :has-add="false" @reset="resetSearchParams" @search="handleSearch" />
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
        :scroll-x="1200"
        :loading="loading"
        remote
        :row-key="row => row.id"
        :pagination="mobilePagination"
        class="sm:h-full"
      />
    </NCard>
    <TablePreview v-model="showPreview" :gen-code-list="genCodeList" />
    <TableImport v-model="showImport" @update:gen-table="getData" />
  </div>
</template>

<style scoped></style>
