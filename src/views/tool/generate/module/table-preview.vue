<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Prism from 'prismjs';

interface Props {
  isShow: boolean;
  genCodeList: Record<string, string>;
}

interface Emits {
  (e: 'updateVisible', visible: boolean): void;
}

defineOptions({ name: 'TablePreview' });
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeName = ref<string>('domain.java');
const show = ref<boolean>(false);

const bodyStyle = {
  width: '1200px'
};

watch(
  () => show.value,
  value => {
    emit('updateVisible', value);
  }
);

watch(
  () => props.isShow,
  value => {
    show.value = value;
    emit('updateVisible', value);
  }
);

function handleTabUpdate() {
  setTimeout(() => {
    Prism.highlightAll();
  }, 200);
}

onMounted(() => {
  setTimeout(() => {
    Prism.highlightAll();
  }, 1500);
});
</script>

<template>
  <div>
    <NModal v-model:show="show" preset="card" :style="bodyStyle" title="代码预览" size="huge" :bordered="false">
      <NTabs :default-value="activeName" @update:value="handleTabUpdate">
        <NTabPane
          v-for="(value, key) in genCodeList"
          :key="value"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :tab="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
        >
          <pre><code class="line-numbers language-sql">{{ value }}</code></pre>
        </NTabPane>
      </NTabs>
    </NModal>
  </div>
</template>

<style scoped></style>
