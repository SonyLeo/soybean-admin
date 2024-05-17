<script setup lang="ts">
import type { SelectOption } from 'naive-ui';
import { $t } from '@/locales';
import { useNaiveForm } from '@/hooks/common/form';

defineOptions({
  name: 'TableSearch'
});

defineProps<{
  dbNameList: SelectOption[];
}>();

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.GenTableForm>('model', { required: true });

const rules = {};

async function reset() {
  await restoreValidation();
  emit('reset');
  emit('search');
}

async function search() {
  await validate();
  emit('search');
}
</script>

<template>
  <NCard :title="$t('common.search')" :bordered="false" size="small" class="card-wrapper">
    <NForm ref="formRef" :model="model" :rules="rules" label-placement="left" label-width="80">
      <NGrid responsive="screen" item-responsive>
        <NFormItemGi span="24 s:12 m:6" label="数据源" path="dataName" class="pr-24px">
          <NSelect v-model:value="model.dataName" clearable :options="dbNameList" placeholder="请选择数据源" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="表名称" path="tableName" class="pr-24px">
          <NInput v-model:value="model.tableName" clearable placeholder="请输入表名称" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="表描述" path="tableComment" class="pr-24px">
          <NInput v-model:value="model.tableComment" clearable placeholder="请输入表描述" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="创建时间" path="dateRange" class="pr-24px">
          <NDatePicker v-model:value="model.dateRange" clearable class="w-full" type="daterange" />
        </NFormItemGi>
        <NFormItemGi span="24 s:24 m:24" class="pr-24px">
          <NSpace class="w-full" justify="end">
            <NButton @click="reset">
              <template #icon>
                <icon-ic-round-refresh class="text-icon" />
              </template>
              {{ $t('common.reset') }}
            </NButton>

            <NButton type="primary" ghost @click="search">
              <template #icon>
                <icon-ic-round-search class="text-icon" />
              </template>
              {{ $t('common.search') }}
            </NButton>
          </NSpace>
        </NFormItemGi>
      </NGrid>
    </NForm>
  </NCard>
</template>
