<script setup lang="ts">
import { ref } from 'vue';
import { isNull } from 'lodash-es';
import { useRouter } from 'vue-router';
import { fetchGetGenTable, fetchUpdateGenTable } from '@/service/api';
import BasicInfo from './module/info-basic.vue';
import FieldInfo from './module/info-field.vue';
import GenerateInfo from './module/info-generate.vue';

interface Props {
  id: string;
}

const props = defineProps<Props>();
const router = useRouter();

const activeName = ref('field');
const basicInfoRef = ref<InstanceType<typeof BasicInfo> | null>(null);
const fieldInfoRef = ref<InstanceType<typeof FieldInfo> | null>(null);
const generateInfoRef = ref<InstanceType<typeof GenerateInfo> | null>(null);

const info = ref<Partial<Api.BackVO.DbTable>>({});
const tableList = ref<Api.BackVO.DbTable[]>([]);
const fieldList = ref<Api.BackVO.DbColumn[]>([]);

async function initGenData() {
  const { data } = await fetchGetGenTable(props.id);
  if (!isNull(data)) {
    info.value = data.info;
    fieldList.value = data.rows;
    tableList.value = data.tables;
  }
}

function handleBack() {
  router.push({ name: 'tool_generate' });
}

async function submit() {
  await fetchUpdateGenTable(Object.assign(info.value, { columns: fieldList.value }));

  initGenData();

  window.$message?.success('更新成功');
}

initGenData();
</script>

<template>
  <NCard size="small" class="sm:flex-1-hidden card-wrapper">
    <NTabs v-model:value="activeName" type="segment" animated>
      <NTabPane name="basic" tab="基本信息">
        <BasicInfo ref="basicInfoRef" v-model="info" />
      </NTabPane>
      <NTabPane name="field" tab="字段信息">
        <FieldInfo ref="fieldInfoRef" v-model:fieldList="fieldList" />
      </NTabPane>
      <NTabPane name="generate" tab="生成信息">
        <GenerateInfo ref="generateInfoRef" v-model:info="info" v-model:tableData="tableList" />
      </NTabPane>
    </NTabs>
    <template #footer>
      <NSpace class="w-full" justify="center">
        <NButton @click="handleBack">
          <template #icon>
            <icon-mingcute:back-fill class="text-icon" />
          </template>
          {{ $t('common.back') }}
        </NButton>

        <NButton ghost @click="submit">
          <template #icon>
            <icon-material-symbols:input-circle-rounded class="text-icon" />
          </template>
          {{ $t('common.submit') }}
        </NButton>
      </NSpace>
    </template>
  </NCard>
</template>

<style scoped></style>
