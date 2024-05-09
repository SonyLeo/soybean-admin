<script setup lang="ts">
import { $t } from '@/locales';
import { useNaiveForm } from '@/hooks/common/form';
import { userGenderOptions } from '@/constants/business';

defineOptions({
  name: 'UserSearch'
});

interface Emits {
  (e: 'reset'): void;
  (e: 'search'): void;
}

const emit = defineEmits<Emits>();

const { formRef, validate, restoreValidation } = useNaiveForm();

const model = defineModel<Api.SystemManage.UserSearchParams>('model', { required: true });

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
        <NFormItemGi span="24 s:12 m:6" label="用户名" path="userName" class="pr-24px">
          <NInput v-model:value="model.userName" placeholder="请输入用户账号" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="用户邮箱" path="email" class="pr-24px">
          <NInput v-model:value="model.email" placeholder="请输入用户邮箱" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="手机号码" path="phonenumber" class="pr-24px">
          <NInput v-model:value="model.phonenumber" placeholder="请输入手机号码" />
        </NFormItemGi>
        <NFormItemGi span="24 s:12 m:6" label="用户性别" path="sex" class="pr-24px">
          <NSelect
            v-model:value="model.sex"
            placeholder="请选择用户性别"
            :options="userGenderOptions"
            clearable
            :render-label="(option: any) => $t(option.label)"
          />
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
