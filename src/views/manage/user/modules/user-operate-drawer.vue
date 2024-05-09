<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/common/form';
import { fetchAddUser, fetchDeptTree, fetchUpdateUser } from '@/service/api';
import { $t } from '@/locales';
import { enableStatusOptions, userGenderOptions } from '@/constants/business';

defineOptions({
  name: 'UserOperateDrawer'
});

interface Props {
  /** the type of operation */
  operateType: NaiveUI.TableOperateType;
  /** the edit row data */
  rowData?: Api.SystemManage.UserVO | null;
}

const props = defineProps<Props>();

interface Emits {
  (e: 'submitted'): void;
}

const emit = defineEmits<Emits>();

const visible = defineModel<boolean>('visible', {
  default: false
});

const { formRef, validate, restoreValidation } = useNaiveForm();
const { defaultRequiredRule } = useFormRules();

const title = computed(() => {
  const titles: Record<NaiveUI.TableOperateType, string> = {
    add: '新增用户信息',
    edit: '编辑用户信息'
  };
  return titles[props.operateType];
});

type Model = Api.SystemManage.UserForm;

const model: Model = reactive(createDefaultModel());

function createDefaultModel(): Model {
  return {
    deptId: null,
    userName: '',
    nickName: '',
    email: '',
    phonenumber: '',
    sex: null,
    avatar: '',
    password: '123456',
    status: null,
    remark: ''
  };
}

type RuleKey = Extract<keyof Model, 'userName' | 'status'>;

const rules: Record<RuleKey, App.Global.FormRule> = {
  userName: defaultRequiredRule,
  status: defaultRequiredRule
};

function handleUpdateModelWhenEdit() {
  if (props.operateType === 'add') {
    Object.assign(model, createDefaultModel());
    return;
  }

  if (props.operateType === 'edit' && props.rowData) {
    Object.assign(model, props.rowData);
  }
}

async function closeDrawer() {
  visible.value = false;
}

async function handleSubmit() {
  await validate();
  // request
  if (!model.id) {
    delete model.id;
    fetchAddUser(model);
    window.$message?.success($t('common.addSuccess'));
  } else {
    fetchUpdateUser(model);
    window.$message?.success($t('common.updateSuccess'));
  }

  emit('submitted');
  closeDrawer();
}

const deptOptions = ref<Selection[]>([]);

async function initDeptOtions() {
  const { data } = await fetchDeptTree();
  deptOptions.value = data;
}

watch(visible, () => {
  if (visible.value) {
    handleUpdateModelWhenEdit();
    restoreValidation();
  }
});

onMounted(() => {
  initDeptOtions();
});
</script>

<template>
  <NDrawer v-model:show="visible" display-directive="show" :width="360">
    <NDrawerContent :title="title" :native-scrollbar="false" closable>
      <NForm ref="formRef" :model="model" :rules="rules">
        <NFormItem label="所属部门" path="deptId" class="pr-24px">
          <NTreeSelect v-model:value="model.deptId" placeholder="请选择部门" :options="deptOptions" clearable />
        </NFormItem>
        <NFormItem label="用户账号" path="userName" class="pr-24px">
          <NInput v-model:value="model.userName" placeholder="请输入用户账号" />
        </NFormItem>
        <NFormItem v-if="$props.operateType === 'add'" label="用户密码" path="password" class="pr-24px">
          <NInput v-model:value="model.password" type="password" placeholder="请输入用户密码" />
        </NFormItem>
        <NFormItem label="用户昵称" path="nickName" class="pr-24px">
          <NInput v-model:value="model.nickName" placeholder="请输入用户昵称" />
        </NFormItem>
        <NFormItem label="用户邮箱" path="email" class="pr-24px">
          <NInput v-model:value="model.email" placeholder="请输入用户邮箱" />
        </NFormItem>
        <NFormItem label="手机号码" path="phonenumber" class="pr-24px">
          <NInput v-model:value="model.phonenumber" placeholder="请输入手机号码" />
        </NFormItem>
        <NFormItem label="用户性别" path="sex" class="pr-24px">
          <NSelect
            v-model:value="model.sex"
            placeholder="请选择用户性别"
            :options="userGenderOptions"
            clearable
            :render-label="(option: any) => $t(option.label)"
          />
        </NFormItem>
        <NFormItem label="帐号状态" path="status" class="pr-24px">
          <NSelect
            v-model:value="model.status"
            placeholder="请选择帐号状态"
            :options="enableStatusOptions"
            clearable
            :render-label="(option: any) => $t(option.label)"
          />
        </NFormItem>
        <NFormItem label="备注" path="remark" class="pr-24px">
          <NInput v-model:value="model.remark" placeholder="请输入备注" />
        </NFormItem>
      </NForm>
      <template #footer>
        <NSpace :size="16">
          <NButton @click="closeDrawer">{{ $t('common.cancel') }}</NButton>
          <NButton type="primary" @click="handleSubmit">{{ $t('common.confirm') }}</NButton>
        </NSpace>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped></style>
