<script setup lang="ts">
import { h, ref, watchEffect } from 'vue';
import type { type DataTableColumns, NCheckbox, NInput, NSelect, NSpace, SelectOption } from 'naive-ui';
import { isNull } from 'lodash-es';
import { useTimeout } from '@vueuse/core';
import { fetchGetDictData } from '@/service/api';
import { htmlTypeOptions, javaSelectOptions, queryTypeOptions } from '@/constants/business';

const { ready, start } = useTimeout(500, { controls: true });

start();

interface Props {
  fieldList: Api.BackVO.DbColumn[];
}

defineOptions({ name: 'FieldInfo' });

const props = defineProps<Props>();
const data = ref<Api.BackVO.DbColumn[]>([]);
const DBDictOptions = ref<SelectOption[]>([]);

type CheckedValue = '0' | '1';

async function initDBDictOptions() {
  const { data: DictData } = await fetchGetDictData();
  if (DictData) {
    DBDictOptions.value = DictData.map(item => {
      return {
        label: item.dictName,
        value: item.dictType
      };
    });
  }
}

initDBDictOptions();

function createColumns(): DataTableColumns<Api.BackVO.DbColumn> {
  return [
    { key: 'columnName', title: '字段列名', width: '150', align: 'center' },
    {
      key: 'fieldInfo',
      title: '字段描述',
      align: 'center',
      width: '140',
      fixed: 'left',
      render: (row, index) => {
        return h(NInput, {
          value: row.columnComment,
          onUpdateValue(v) {
            data.value[index].columnComment = v;
          }
        });
      }
    },
    { key: 'columnType', title: '物理类型', width: '150', align: 'center' },
    {
      key: 'columnType',
      title: 'Java类型',
      align: 'center',
      width: '145',
      render: (row, index) => {
        return h(NSelect, {
          options: javaSelectOptions,
          value: row.javaType,
          onUpdateValue(v) {
            data.value[index].javaType = v;
          }
        });
      }
    },
    {
      key: 'javaField',
      title: 'Java属性',
      align: 'center',
      width: '150',
      render: (row, index) => {
        return h(NInput, {
          value: row.javaField,
          onUpdateValue(v) {
            data.value[index].javaField = v;
          }
        });
      }
    },
    {
      key: 'isInsert',
      title: '插入',
      align: 'center',
      render: (row, index) => {
        const checked = row.isInsert === '1';
        return h(NCheckbox, {
          checked,
          onUpdateChecked(v: CheckedValue) {
            const enterValue = v ? '1' : '0';
            data.value[index].isInsert = enterValue;
          }
        });
      }
    },
    {
      key: 'isEdit',
      title: '编辑',
      align: 'center',
      render: (row, index) => {
        const checked = row.isEdit === '1';
        return h(NCheckbox, {
          checked,
          onUpdateChecked(v: CheckedValue) {
            const enterValue = v ? '1' : '0';
            data.value[index].isEdit = enterValue;
          }
        });
      }
    },
    {
      key: 'isList',
      title: '列表',
      align: 'center',
      render: (row, index) => {
        const checked = row.isList === '1';
        return h(NCheckbox, {
          checked,
          onUpdateChecked(v: CheckedValue) {
            const enterValue = v ? '1' : '0';
            data.value[index].isList = enterValue;
          }
        });
      }
    },
    {
      key: 'isQuery',
      title: '查询',
      align: 'center',
      render: (row, index) => {
        const checked = row.isQuery === '1';
        return h(NCheckbox, {
          checked,
          onUpdateChecked(v: CheckedValue) {
            const enterValue = v ? '1' : '0';
            data.value[index].isQuery = enterValue;
          }
        });
      }
    },
    {
      key: 'queryType',
      title: '查询方式',
      align: 'center',
      width: '140',
      render: (row, index) => {
        return h(NSelect, {
          options: queryTypeOptions,
          value: row.queryType,
          onUpdateValue(v) {
            data.value[index].queryType = v;
          }
        });
      }
    },
    {
      key: 'isRequired',
      title: '必填',
      align: 'center',
      render: (row, index) => {
        const checked = row.isRequired === '1';
        return h(NCheckbox, {
          checked,
          onUpdateChecked(v: CheckedValue) {
            const enterValue = v ? '1' : '0';
            data.value[index].isRequired = enterValue;
          }
        });
      }
    },
    {
      key: 'htmlType',
      title: '显示类型',
      align: 'center',
      width: '140',
      render: (row, index) => {
        return h(NSelect, {
          options: htmlTypeOptions,
          value: row.htmlType,
          onUpdateValue(v) {
            data.value[index].htmlType = v;
          }
        });
      }
    },
    {
      key: 'dictType',
      title: '字典类型',
      align: 'center',
      width: '240',
      render: (row, index) => {
        return h(NSelect, {
          options: DBDictOptions.value,
          value: row.dictType,
          onUpdateValue(v) {
            data.value[index].dictType = v;
          },
          renderLabel: (option: CommonType.Option) => {
            return h(
              NSpace,
              {
                display: 'flex'
              },
              {
                default: () => [
                  h('div', option.label),
                  h('div', { style: 'font-size: 11px; color: #999;' }, option.value)
                ]
              }
            );
          },
          renderTag: ({ option }) => {
            return option.label as string;
          }
        });
      }
    }
  ];
}

const columns = ref<DataTableColumns<Api.BackVO.DbColumn>>(createColumns());

const tableHeight = ref<string>(`${document.documentElement.scrollHeight - 420}px`);

watchEffect(() => {
  const tempData = props.fieldList;
  if (!isNull(tempData)) {
    data.value = tempData;
  }
});
</script>

<template>
  <NCard size="small" class="sm:flex-1-hidden card-wrapper">
    <NDataTable :loading="!ready" :scroll-x="1500" :columns="columns" :data="data" :max-height="tableHeight" />
  </NCard>
</template>

<style scoped></style>
