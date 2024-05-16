<script setup lang="ts">
import { onMounted } from 'vue';
import { fetchDBTableList, fetchImportGenTable } from '@/service/api';
import { $t } from '@/locales';
import { useTable, useTableOperate } from '@/hooks/common/table';

const showImport = defineModel({ type: Boolean });

const { columns, data, getData, loading, mobilePagination, searchParams, resetSearchParams } = useTable({
  apiFn: fetchDBTableList,
  apiParams: {
    current: 1,
    size: 5,
    // if you want to use the searchParams in Form, you need to define the following properties, and the value is null
    // the value can not be undefined, otherwise the property in Form will not be reactive
    dataName: null,
    tableName: '',
    tableComment: ''
  },
  columns: () => [
    {
      type: 'selection',
      align: 'center',
      width: 48
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
    }
  ],
  showTotal: true
});

const { checkedRowKeys } = useTableOperate(data, getData);

interface Emits {
  /** Update genTable */
  (e: 'update:genTable'): void;
}
const emit = defineEmits<Emits>();

async function handelConfirm() {
  const tables = checkedRowKeys.value.join(',');
  const dataName = 'master';
  await fetchImportGenTable({ tables, dataName });
  showImport.value = false;

  emit('update:genTable');
}

function reset() {
  resetSearchParams();
  getData();
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div>
    <NModal v-model:show="showImport" preset="card" class="w-1200px" title="导入表" size="huge" :bordered="false">
      <NCard segmented>
        <template #header>
          <NForm :model="searchParams" label-placement="left">
            <NGrid responsive="screen" item-responsive>
              <NFormItemGi span="24 s:12 m:6" label="数据源" path="dataName">
                <NInput v-model:value="searchParams.dataName" placeholder="请选择数据源" />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" label="表名称" path="tableName" class="pr-24px">
                <NInput v-model:value="searchParams.tableName" placeholder="请输入表名称" />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" label="表描述" path="tableComment" class="pr-24px">
                <NInput v-model:value="searchParams.tableComment" placeholder="请输入表描述" />
              </NFormItemGi>
              <NFormItemGi span="24 s:12 m:6" class="pr-24px">
                <NSpace class="w-full" justify="end">
                  <NButton @click="reset">
                    <template #icon>
                      <icon-ic-round-refresh class="text-icon" />
                    </template>
                    {{ $t('common.reset') }}
                  </NButton>

                  <NButton type="primary" ghost @click="getData">
                    <template #icon>
                      <icon-ic-round-search class="text-icon" />
                    </template>
                    {{ $t('common.search') }}
                  </NButton>
                </NSpace>
              </NFormItemGi>
            </NGrid>
          </NForm>
        </template>

        <NDataTable
          v-model:checked-row-keys="checkedRowKeys"
          :columns="columns"
          :data="data"
          size="small"
          :loading="loading"
          :row-key="row => row.tableName"
          :pagination="mobilePagination"
          class="sm:h-full"
        />

        <template #footer>
          <NSpace justify="center">
            <NButton type="primary" ghost @click="handelConfirm">
              {{ $t('common.confirm') }}
            </NButton>
            <NButton ghost @click="showImport = false">
              {{ $t('common.cancel') }}
            </NButton>
          </NSpace>
        </template>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped></style>
