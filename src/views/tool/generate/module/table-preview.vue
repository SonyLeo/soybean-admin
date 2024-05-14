<script setup lang="ts">
import { ref } from 'vue';
import Prism from 'prismjs';

interface Props {
  genCodeList: Record<string, string>;
}

defineOptions({ name: 'TablePreview' });
defineProps<Props>();

const showModel = defineModel({ type: Boolean });
const activeName = ref<string>('domain.java');

function handleTabUpdate() {
  setTimeout(() => {
    Prism.highlightAll();
  }, 200);
}

function handleEnter() {
  handleTabUpdate();
}
</script>

<template>
  <div>
    <NModal
      v-model:show="showModel"
      preset="card"
      class="w-1200px"
      title="代码预览"
      size="huge"
      :bordered="false"
      :on-after-enter="handleEnter"
    >
      <NTabs :default-value="activeName" type="card" animated @update:value="handleTabUpdate">
        <NTabPane
          v-for="(value, key) in genCodeList"
          :key="value"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :tab="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
        >
          <NScrollbar class="max-h-150" trigger="hover">
            <pre><code class="line-numbers language-javascript match-braces">{{ value }}</code></pre>
          </NScrollbar>
        </NTabPane>
      </NTabs>
    </NModal>
  </div>
</template>

<style scoped></style>
