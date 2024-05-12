<script setup lang="ts">
import { computed, ref } from 'vue';
defineOptions({ name: 'BasicInfo' });

interface Props {
  info: Partial<Api.BackVO.DbTable>;
}

const props = defineProps<Props>();

const model = computed(() => props.info);

const rules = ref({
  tableName: [{ required: true, message: '请输入表名称', trigger: 'blur' }],
  tableComment: [{ required: true, message: '请输入表描述', trigger: 'blur' }],
  className: [{ required: true, message: '请输入实体类名称', trigger: 'blur' }],
  functionAuthor: [{ required: true, message: '请输入作者', trigger: 'blur' }]
});
</script>

<template>
  <NCard size="small" class="sm:flex-1-hidden card-wrapper">
    <NForm :model="model" :rules="rules" label-placement="left" label-width="80">
      <NGrid responsive="screen" item-responsive>
        <NFormItemGi span="24 s:12 m:12" label-width="100" label="表名称" path="tableName" class="pr-24px">
          <NInput v-model:value="model.tableName" placeholder="请输入表名称" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:12" label="表描述" path="tableComment" class="pr-24px">
          <NInput v-model:value="model.tableComment" placeholder="请输入表描述" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:12" label-width="100" label="实体类名称" path="className" class="pr-24px">
          <NInput v-model:value="model.className" class="w-full" placeholder="请输入实体类名称" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:12" label="作者" path="functionAuthor" class="pr-24px">
          <NInput v-model:value="model.functionAuthor" class="w-full" placeholder="请输入作者名称" />
        </NFormItemGi>
        <NFormItemGi span="24 s:24 m:24" label-width="100" label="备注" path="remark" class="pr-24px">
          <NInput v-model:value="model.remark" type="textarea" class="w-full" />
        </NFormItemGi>
      </NGrid>
    </NForm>
  </NCard>
</template>

<style scoped></style>
