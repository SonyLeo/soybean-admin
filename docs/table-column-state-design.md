# 表格列设置持久化设计方案

## 背景

项目当前已经具备表格列设置的基础能力：

- 列显隐
- 固定列切换
- 拖拽排序

相关实现主要集中在以下位置：

- `packages/hooks/src/use-table.ts`
- `src/hooks/common/table.ts`
- `src/components/advanced/table-column-setting.vue`

当前缺少的能力是：

- 列设置状态刷新后丢失，无法通过本地存储持久化
- 无法通过异步方法覆盖默认恢复逻辑

根据 issue 描述和 `vxe-table` 的参考语义，目标是支持：

- 默认通过本地存储恢复列设置
- 支持一个 `Promise` 方法覆盖默认恢复逻辑

## 目标

一期仅覆盖“列设置持久化”本身，不扩大到整张表状态。

### 需要支持

- 通过本地存储持久化列设置
- 按表格唯一 `id` 隔离不同表的列状态
- 同一浏览器下不同登录用户的列状态互不污染
- 支持 `restoreStore` 以 Promise 形式覆盖默认恢复逻辑
- 切换语言或列工厂重新计算时，保留用户自定义列顺序、显隐、固定状态
- 支持恢复默认列设置

### 一期暂不支持

- 分页、筛选、排序等整表状态持久化
- 列宽持久化
- 服务端保存回写接口 `updateStore`
- 跨设备同步冲突处理

## 参考调研结论

### vxe-table 语义

从本地源码可确认：

- `storage` 开启后，会按表格 `id` 从本地恢复列自定义状态
- `restoreStore` 会接收本地 `storeData`，并覆盖默认恢复逻辑
- 恢复发生在列初始化阶段，恢复完成后才继续后续列解析
- 源码中还存在对称的 `updateStore`，但本次 issue 未强制要求

关键源码位置：

- `E:/LS_WorkSpace/downloads/vxe-table-main/vxe-table-main/packages/table/src/table.ts`
- `E:/LS_WorkSpace/downloads/vxe-table-main/vxe-table-main/packages/ui/index.ts`

### 业界共性

主流表格库的最佳实践基本一致：

- 只持久化可序列化的状态切片
- 使用显式的唯一 key 或 id 区分不同表
- 恢复行为应视为初始化流程的一部分
- 合并时按列 key 对齐，而不是按标题或索引
- 需要考虑版本兼容和新增列/删除列场景

## 当前实现现状

### 已有能力

当前项目已经有 `TableColumnCheck` 作为列设置状态模型，包含：

- `key`
- `title`
- `checked`
- `visible`
- `fixed`

`TableColumnSetting` 组件已经支持：

- 勾选显示/隐藏
- 固定列切换
- 拖拽排序

### 当前问题

#### 1. 状态未持久化

刷新页面后，列设置回到默认态。

#### 2. reloadColumns 状态合并不完整

当前 `reloadColumns()` 只保留了：

- `checked`
- `fixed`

没有保留：

- 用户拖拽后的列顺序
- 显式取消固定后的 `unFixed` 语义

这会导致：

- 切换语言后列顺序可能丢失
- 默认固定列被用户取消固定后，后续重新计算列时又恢复默认固定

#### 3. title 不可直接持久化

`title` 当前可能是函数或 vnode 渲染入口，因此不能直接把完整 `TableColumnCheck[]` 原样写入 storage。

## 总体设计

采用“两层实现”：

### 第一层：通用列状态合并

位置：

- `packages/hooks/src/use-table.ts`

职责：

- 负责列状态的默认生成与稳定合并
- 不直接依赖本地存储

### 第二层：应用层持久化与恢复

位置：

- `src/hooks/common/table.ts`
- `src/utils/table-column-state.ts`（新增）

职责：

- 负责 storage 读写
- 负责 `restoreStore` 调用与最终恢复
- 负责监听 `columnChecks` 并自动落盘

这样做的原因：

- `packages/hooks` 是通用层，不适合直接依赖 `src/utils/storage.ts`
- 应用层更适合封装本地存储、版本、恢复策略

## API 设计

建议在 `useNaiveTable` 和 `useNaivePaginatedTable` 中增加 `columnState` 配置。

```ts
type PersistedTableColumnItem = {
  key: string;
  checked: boolean;
  fixed: 'left' | 'right' | 'unFixed';
};

type PersistedTableColumnState = {
  version?: string;
  updatedAt: number;
  columns: PersistedTableColumnItem[];
};

type TableColumnStateOptions = {
  id: string;
  storage?: boolean;
  version?: string;
  /**
   * whether to block column rendering until restore is completed
   *
   * @default true
   */
  blockUntilRestored?: boolean;
  restoreStore?: (params: {
    id: string;
    type: 'restore';
    storeData: PersistedTableColumnState | null;
  }) => Promise<PersistedTableColumnState | null | void> | PersistedTableColumnState | null | void;
};
```

接入方式示例：

```ts
const table = useNaivePaginatedTable({
  api: fetchUserList,
  columns,
  transform: defaultTransform,
  columnState: {
    id: 'system-user:list',
    storage: true,
    version: '1',
    blockUntilRestored: true,
    restoreStore: async ({ storeData }) => {
      const remote = await fetchUserTablePreference();
      return remote ?? storeData;
    }
  }
});
```

## restoreStore 语义约定

为了贴近 `vxe-table`，建议采用“覆盖默认恢复逻辑”而不是“恢复后通知”的语义。

### 建议规则

- `restoreStore` 只在 `storage: true` 时生效
- `storeData` 为本地已有状态，可能为 `null`
- `restoreStore` 返回值作为最终恢复来源
- 返回 `null` 或 `undefined` 时，不应用任何用户态，保留默认列状态
- 如果想优先远端、失败回退本地，则由调用方在回调里自行处理，例如 `return remote ?? storeData`
- `restoreStore` 返回结果在应用前需要做 shape 校验和 normalize
- 当 `storage: true` 且 `restoreStore` 返回了有效结果时，最终恢复态需要回写本地缓存

### normalize 规则

建议在应用 `restoreStore` 返回值之前统一做 normalize：

- 只保留当前列定义中存在的 `key`
- 缺失 `checked` 时回退默认值
- 缺失 `fixed` 时回退默认值
- 非法 `fixed` 值统一回退为默认值
- 保留返回数组顺序作为最终列顺序
- 忽略多余字段

## 存储设计

建议在本地 storage 中新增一个统一桶：

```ts
interface Local {
  tableColumnSettings: {
    schemaVersion: 1;
    users: Record<
      string,
      {
        tables: Record<string, PersistedTableColumnState>;
      }
    >;
  };
}
```

示例结构：

```json
{
  "schemaVersion": 1,
  "users": {
    "user_1001": {
      "tables": {
        "system-user:list": {
          "version": "1",
          "updatedAt": 1775000000000,
          "columns": [
            { "key": "__selection__", "checked": true, "fixed": "left" },
            { "key": "userName", "checked": true, "fixed": "unFixed" },
            { "key": "role", "checked": false, "fixed": "unFixed" }
          ]
        }
      }
    }
  }
}
```

### 设计原因

- 复用现有 `localStg`
- 用 `用户 + id` 区分不同表
- 便于后续 schema 升级
- 单次读写只需处理一份统一结构

### 用户维度规则

建议通过当前登录态获取用户维度：

- 已登录用户：使用 `authStore.userInfo.userId`
- 未登录场景：使用固定保底值，例如 `__anonymous__`

组合维度建议为：

- storage 桶按用户分组
- 用户分组下再按 `id` 存储单表状态

这样可以避免：

- 同一浏览器切换账号后列设置相互污染
- 退出登录再登录其它用户时读取到前一个用户的列偏好

## 持久化内容

只持久化最小可序列化状态：

- `key`
- `checked`
- `fixed`

列顺序使用数组顺序本身表达。

### 不持久化

- `title`
- `visible`
- 组件函数
- 其它运行时派生信息

原因：

- `title` 可能是函数，不适合序列化
- `visible` 是列设置面板展示策略，不是用户偏好

## 核心实现建议

### 1. 重构 use-table 的列状态合并逻辑

在 `packages/hooks/src/use-table.ts` 中新增通用 helper，例如：

```ts
type SerializableColumnState = Pick<TableColumnCheck, 'key' | 'checked' | 'fixed'>;

function mergeColumnChecks(
  defaultChecks: TableColumnCheck[],
  sourceChecks: SerializableColumnState[]
): TableColumnCheck[] {
  const sourceMap = new Map(sourceChecks.map((item, index) => [item.key, { ...item, index }]));

  return defaultChecks
    .map((item, defaultIndex) => {
      const source = sourceMap.get(item.key);

      return {
        order: source ? source.index : Number.MAX_SAFE_INTEGER + defaultIndex,
        value: {
          ...item,
          checked: source ? source.checked : item.checked,
          fixed: source ? source.fixed : item.fixed
        }
      };
    })
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}
```

### 2. reloadColumns 改为稳定合并

当前 `reloadColumns()` 应改为：

- 重新计算默认列定义
- 按 key 把当前状态 merge 回去
- 保留顺序
- 保留显式 `unFixed`

建议签名：

```ts
reloadColumns(sourceChecks?: SerializableColumnState[]): void
setColumnChecks(checks: TableColumnCheck[]): void
```

### 3. 新增 table-column-state 工具文件

新增文件：

- `src/utils/table-column-state.ts`

建议封装的方法：

```ts
readTableColumnState(userId: string, id: string, version?: string): PersistedTableColumnState | null
writeTableColumnState(userId: string, id: string, state: PersistedTableColumnState): void
removeTableColumnState(userId: string, id: string): void
serializeColumnChecks(checks: TableColumnCheck[]): PersistedTableColumnState
normalizePersistedColumnState(
  defaultChecks: TableColumnCheck[],
  state: PersistedTableColumnState | null
): PersistedTableColumnState | null
```

### 4. 在 useNaiveTable 中接入恢复逻辑

在 `src/hooks/common/table.ts` 中：

- 初始化后读取本地状态
- 调用 `restoreStore`
- 将最终结果合并并设置回 `result.columnChecks`

建议流程：

1. 生成默认 `columnChecks`
2. 根据当前登录用户读取本地缓存
3. 若配置 `restoreStore`，将本地缓存传入
4. 对最终返回结果做 normalize
5. 将最终恢复状态应用到当前列状态
6. 若 `storage: true` 且最终恢复结果有效，则把最终结果回写本地缓存
7. 恢复完成后再开启持久化监听

## 初始化时序建议

需要特别注意持久化监听的开启时机。

### 正确流程

1. 初始化默认列状态
2. 执行恢复逻辑
3. 将恢复结果应用到当前列状态
4. 恢复结束后，再开启 watch 持久化

### 原因

如果在恢复完成前就开始 watch：

- 默认态会先被写入 storage
- 可能覆盖已有本地缓存

建议增加一个内部标记：

```ts
const canPersist = ref(false);
```

恢复完成后再置为 `true`。

## 渲染与就绪策略

为了更接近 `vxe-table` 的初始化恢复语义，建议明确异步恢复期间的渲染策略。

### 推荐策略

- 默认 `blockUntilRestored: true`
- 若存在本地同步缓存，优先同步恢复本地状态
- 若存在异步 `restoreStore`，在异步恢复结束前不暴露最终列配置给表格组件

### hook 返回值建议

建议在 `useNaiveTable` / `useNaivePaginatedTable` 中额外暴露：

```ts
columnStateReady: Ref<boolean>
restoringColumnState: Ref<boolean>
resetColumnState(): void
```

### 行为约定

- `columnStateReady = false` 时，表格列配置仍处于恢复中
- `restoringColumnState = true` 时，表示存在异步恢复任务尚未完成
- 若 `blockUntilRestored = true`，则 `columns` 在恢复完成前返回空数组
- 若 `blockUntilRestored = false`，则允许先渲染默认/本地状态，异步恢复完成后再热更新

### 为什么推荐默认阻塞

这样可以避免：

- 首屏先渲染默认列，再跳变成远端列状态
- 列闪烁
- 表头和列设置弹层短时间不一致

## 自动持久化策略

建议对 `result.columnChecks` 做深度监听并防抖写入。

```ts
watch(
  () => result.columnChecks.value,
  useDebounceFn(checks => {
    if (!canPersist.value || !columnState?.storage) return;

    writeTableColumnState(columnState.id, serializeColumnChecks(checks, columnState.version));
  }, 200),
  { deep: true }
);
```

### 会自动触发持久化的操作

- 勾选/取消列
- 固定列切换
- 拖拽排序

### 自动回写规则

除了用户交互触发的自动落盘外，还建议补充以下规则：

- `restoreStore` 返回有效状态后，回写本地
- `resetColumnState()` 后，删除本地缓存
- 登录用户切换后，新用户读取自己的独立列状态

## reset 能力

建议一期在 hook 层预留 reset 能力，即使暂时不在 UI 上加按钮。

建议暴露：

```ts
resetColumnState(): void
```

行为：

- 删除当前用户当前表的本地缓存
- 恢复到默认列设置
- 允许后续持久化继续生效

## 兼容规则

### 新增列

若默认列中有新 key，而历史缓存中不存在：

- 该列自动追加到末尾
- 使用默认 `checked` 和 `fixed`

### 删除列

若历史缓存中的 key 已不存在于当前列定义：

- 忽略该 key

### 版本变化

若传入了 `version` 且与缓存版本不一致：

- 直接视为缓存失效
- 回退默认列设置

### storage 但无 id

若启用了 `storage: true` 但没有 `id`：

- 不启用列状态持久化
- 开发环境可打印 warning

### 用户切换

若当前登录用户发生切换：

- 新用户只读取自己的列状态
- 不继承上一个用户的表格偏好
- 若无用户态缓存，则回退默认列设置

## 对现有代码的改动建议

### packages/hooks/src/use-table.ts

建议改动：

- 抽离列状态 merge helper
- 支持保留顺序
- 支持显式 `unFixed`
- 暴露 `setColumnChecks`
- 扩展 `reloadColumns(sourceChecks?)`

### src/hooks/common/table.ts

建议改动：

- 扩展 `UseNaiveTableOptions`
- 新增 `columnState` 配置
- 接入 storage 恢复与 watch 持久化
- 暴露 `columnStateReady`
- 暴露 `restoringColumnState`
- 暴露 `resetColumnState`

### src/utils/table-column-state.ts

建议新增：

- storage 读写
- 序列化/反序列化
- 版本校验

### src/typings/storage.d.ts

建议新增：

- `tableColumnSettings`

## 建议的验收标准

### 基础场景

- 首次进入页面，无缓存时使用默认列设置
- 勾选、取消、固定、拖拽后刷新，状态可以恢复
- 同一浏览器切换不同用户后，彼此列状态互不污染

### 语言切换

- 切换语言后列标题更新
- 用户自定义顺序、显隐、固定状态不丢

### 默认固定列场景

- 默认固定列手动取消固定后
- 刷新或重建列定义后，依然保持取消固定

### 结构变化场景

- 新增列后旧缓存不报错，新列自动追加
- 删除列后旧缓存中的多余 key 被忽略

### restoreStore 场景

- `restoreStore` 返回远端状态时，以远端状态为准
- `restoreStore` 返回本地状态时，与默认恢复一致
- `restoreStore` 抛错时，页面仍正常展示
- `restoreStore` 返回远端状态后，本地缓存同步更新为最终结果

### 渲染时序场景

- `blockUntilRestored = true` 时，异步恢复完成前不渲染最终列配置
- `blockUntilRestored = false` 时，允许先渲染默认/本地列配置，恢复完成后热更新
- `columnStateReady` 能正确反映列状态是否已经可用

## 风险与注意事项

### 1. 不建议把 title 写入 storage

这会带来序列化问题和多语言兼容问题。

### 2. 不建议在组件层做存储

`TableColumnSetting` 只应处理 UI 交互，不应直接承担本地存储与恢复逻辑。

### 3. 不建议一期直接做 updateStore

虽然 `vxe-table` 源码里有对称的保存扩展点，但当前 issue 的最小可交付目标不需要把能力扩展到远端保存。

### 4. 需要防止初始化写覆盖

恢复未完成前不能开启持久化监听。

### 5. 需要考虑用户维度隔离

如果只按表 `id` 存储，会导致多个用户在同一浏览器共享列偏好。

### 6. 需要对 restoreStore 的结果做安全校验

远端返回的数据不能直接信任，需要先 normalize 再应用。

## 后续扩展方向

若一期效果稳定，后续可考虑：

- 增加 `updateStore` 以支持服务端保存
- 持久化列宽
- 在列设置弹层增加“恢复默认”按钮
- 统一封装为更通用的表格状态持久化能力

## 结论

这次实现最合适的策略是：

- 保持列设置 UI 不变
- 在 hook 层实现列状态恢复与持久化
- 用 `id + storage + restoreStore` 作为最小接口
- 修复当前列状态合并逻辑中的顺序丢失和 `unFixed` 失效问题

这套方案与当前仓库结构、维护者 issue 描述、以及 `vxe-table` 参考语义都比较一致，适合作为一期实现方向。
