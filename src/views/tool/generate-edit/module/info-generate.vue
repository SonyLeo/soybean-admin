<script setup lang="ts">
import type { SelectOption } from 'naive-ui';
import { NSelect } from 'naive-ui';
import { ref, watchEffect } from 'vue';
import { genPathOptions, genTemplateOptions } from '@/constants/business';

defineOptions({ name: 'GenerateInfo' });

const model = defineModel<Partial<Api.BackVO.DbTable>>('info', { required: true, default: () => {} });

function handleUpdateTplCategory(value: string) {
  if (value !== 'sub') {
    model.value.subTableName = '';
    model.value.subTableFkName = '';
  }
}

function handleGenPathSelect(key: string) {
  model.value.genPath = key;
}

const table = defineModel<Api.BackVO.DbTable[]>('tableData', { required: true });
const tableColumnOptions = ref<SelectOption[]>([]);

function setSubTableColumns(value: string) {
  table.value.forEach((item: Api.BackVO.DbTable) => {
    const tableName = item.tableName;
    if (tableName === value) {
      tableColumnOptions.value = item.columns.map(column => ({
        label: `${column.columnName}-->${column.columnComment}`,
        value: column.columnName
      }));
    }
  });
}

watchEffect(() => {
  const tableName = model.value.tableName;
  if (tableName) {
    setSubTableColumns(tableName);
  }
});
</script>

<template>
  <div>
    <NCard title="基础信息" class="sm:flex-1-hidden card-wrapper">
      <NForm :model="model" :rules="{}" label-placement="left" label-width="80">
        <NGrid responsive="screen" item-responsive>
          <NFormItemGi span="24 s:12 m:12" label="生成模板" path="tplCategory" class="pr-24px">
            <NSelect
              v-model:value="model.tplCategory"
              :options="genTemplateOptions"
              placeholder="请选择生成模板"
              @update:value="handleUpdateTplCategory"
            />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:12" label="包路径" path="packageName" class="pr-24px">
            <NInput v-model:value="model.packageName" placeholder="请输入包路径" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:12" label="模块名" path="moduleName" class="pr-24px">
            <NInput v-model:value="model.moduleName" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:12" label="业务名" path="businessName" class="pr-24px">
            <NInput v-model:value="model.businessName" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:12" label="功能名" path="functionName" class="pr-24px">
            <NInput v-model:value="model.functionName" class="w-full" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:12" label="上级菜单" path="functionName" class="pr-24px">
            <NInput v-model:value="model.parentMenuId" class="w-full" placeholder="请选择上级菜单" />
          </NFormItemGi>
          <NFormItemGi span="24 s:12 m:12" label="生成方式" path="genType" class="pr-24px">
            <NRadioGroup v-model:value="model.genType" name="radiogroup">
              <NSpace>
                <NRadio :key="0" value="0">zip压缩包</NRadio>
                <NRadio :key="1" value="1">自定义路径</NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi
            v-if="model.genType === '1'"
            span="24 s:12 m:12"
            label="自定义路径"
            path="genPath"
            class="pr-24px"
          >
            <NButtonGroup class="w-full">
              <NInput v-model:value="model.genPath" placeholder="请输入自定义路径"></NInput>
              <NDropdown trigger="hover" :options="genPathOptions" @select="handleGenPathSelect">
                <NButton type="tertiary">最近路径快速选择</NButton>
              </NDropdown>
            </NButtonGroup>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NCard>
    <div v-if="info.tplCategory == 'tree'">
      <NCard title="其它信息" class="mt-20px sm:flex-1-hidden card-wrapper">
        <NForm :model="model" :rules="{}" label-placement="left" label-width="80">
          <NGrid responsive="screen" item-responsive>
            <NFormItemGi span="24 s:12 m:12" label-width="120" label="树编码字段" path="treeCode" class="pr-24px">
              <NSelect v-model:value="model.treeCode" :options="tableColumnOptions" placeholder="请选择" />
            </NFormItemGi>
            <NFormItemGi
              span="24 s:12 m:12"
              label-width="120"
              label="树父编码字段"
              path="treeParentCode"
              class="pr-24px"
            >
              <NSelect v-model:value="model.treeParentCode" :options="tableColumnOptions" placeholder="请选择" />
            </NFormItemGi>
            <NFormItemGi span="24 s:12 m:12" label-width="120" label="树名称字段" path="treeName" class="pr-24px">
              <NSelect v-model:value="model.treeName" :options="tableColumnOptions" class="w-full" />
            </NFormItemGi>
          </NGrid>
        </NForm>
      </NCard>
    </div>
  </div>
</template>

<style scoped></style>
