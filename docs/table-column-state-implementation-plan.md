# 表格列设置持久化实施计划与测试方案

## 文档目的

本文档用于把“表格列设置持久化”方案拆解为可执行的分阶段实施计划，并为每个阶段定义：

- 具体实施内容
- 阶段完成标准
- 验证目标
- 对应的 unit 测试案例
- 对应的 e2e 测试案例

配套设计文档：

- `docs/table-column-state-design.md`
- `docs/table-column-state-validation-cleanup.md`

## 总体原则

### 实施原则

- 先补测试基础设施，再推进功能开发
- 优先实现纯函数和通用 helper，并先用 unit 测试覆盖
- 存储与恢复逻辑放在 hook 层，不侵入 `TableColumnSetting` 组件交互
- 每个阶段都要有明确出口，避免多项能力一起落地导致回归面失控
- 阶段 0 引入的测试基础设施、测试页和测试用脚本默认视为“临时验证资产”，功能验收完成后需按文档清理

### 测试原则

- 纯函数与存储逻辑优先用 unit 测试覆盖
- hook 集成逻辑通过 unit + 组件级测试覆盖
- 最终用户链路通过 e2e 验证，包括刷新、异步恢复、用户隔离、语言切换
- 对于异步恢复、用户切换、结构变化等高风险路径，必须有自动化回归

## 现状判断

当前仓库没有现成测试基础设施：

- 没有 `vitest.config.*`
- 没有 `playwright.config.*`
- 没有现成 `spec` / `test` 文件
- 根 `package.json` 也没有测试脚本

因此，测试基础设施必须作为第 0 阶段单独落地。

## 临时验证资产说明

本次阶段 0 引入的以下内容默认视为临时验证资产：

- `vitest` / `playwright` 相关依赖
- 根脚本中的 `test:unit` / `test:e2e`
- `tests/` 目录
- 测试专用页面
- 测试专用隐藏路由
- 为测试服务的本地配置调整

这些内容的移除原则、文件清单和操作顺序统一记录在：

- `docs/table-column-state-validation-cleanup.md`

在功能完全验证完毕并确认不保留自动化测试方案后，应按照该文档执行清理。

## 推荐测试技术栈

### Unit / 组件测试

- `vitest`
- `@vue/test-utils`
- `happy-dom` 或 `jsdom`
- `@vitest/coverage-v8`

### E2E 测试

- `playwright`

### 推荐脚本

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 推荐测试目录结构

```txt
docs/
  table-column-state-design.md
  table-column-state-implementation-plan.md

packages/hooks/src/__tests__/
  use-table.spec.ts

src/utils/__tests__/
  table-column-state.spec.ts

src/hooks/common/__tests__/
  table-column-state-hook.spec.ts

tests/e2e/
  table-column-state.spec.ts
  fixtures/
    table-column-state-page.ts

tests/setup/
  unit.setup.ts
```

## 推荐测试承载页面

由于当前仓库缺少真实业务表格页面，e2e 需要一张稳定的测试承载页。

建议新增一个仅测试环境使用的隐藏页面，例如：

- `src/test-pages/table-column-state/index.vue`

推荐特征：

- 隐藏在菜单之外
- 在 `test` 环境可访问
- 使用 `useNaiveTable` 或 `useNaivePaginatedTable`
- 提供可控的测试按钮或 query 参数
- 支持切换登录用户、切换语言、切换列定义版本、模拟异步恢复成功/失败

推荐可观测元素：

- 表格实例
- 列设置按钮
- Reset 按钮
- 当前用户 id 展示
- 当前 locale 展示
- `columnStateReady` 状态展示
- `restoringColumnState` 状态展示

## 分阶段计划

## 阶段 0：测试基础设施与测试承载页

### 实施内容

- 安装并配置 `vitest`
- 安装并配置 `@vue/test-utils`
- 安装并配置 `playwright`
- 增加根测试脚本
- 增加 unit 测试 setup 文件
- 增加 e2e 配置文件
- 新增测试承载页与隐藏路由
- 增加最小 smoke 测试

### 建议新增文件

- `vitest.config.ts`
- `playwright.config.ts`
- `tests/setup/unit.setup.ts`
- `tests/e2e/table-column-state.spec.ts`
- `src/test-pages/table-column-state/index.vue`

### 阶段出口

- 本地可以运行 `pnpm test:unit`
- 本地可以运行 `pnpm test:e2e`
- 测试页在 `test` 环境可访问
- smoke 测试可稳定通过
- 临时验证资产清单已同步记录到清理文档

### 验证目标

- 测试环境能够稳定启动
- 测试页能够在浏览器中渲染出基础表格和列设置按钮
- 不引入对生产环境菜单和路由的干扰

### Unit 测试案例

| 编号  | 用例                               | 目标                             |
| ----- | ---------------------------------- | -------------------------------- |
| U0-01 | 应用测试环境可正常挂载测试页组件   | 验证 `vitest + vue` 基础链路可用 |
| U0-02 | 测试承载页默认渲染表格与列设置按钮 | 验证测试页结构稳定               |

### E2E 测试案例

| 编号  | 用例                         | 目标                   |
| ----- | ---------------------------- | ---------------------- |
| E0-01 | 访问测试页成功打开并出现表格 | 验证 e2e 环境可用      |
| E0-02 | 点击列设置按钮可打开弹层     | 验证后续交互承载点可用 |

## 阶段 1：通用列状态模型与稳定合并

### 实施内容

- 重构 `packages/hooks/src/use-table.ts`
- 抽离 `mergeColumnChecks`
- 支持 `setColumnChecks`
- 改造 `reloadColumns()`，确保：
  - 保留用户顺序
  - 保留显式 `unFixed`
  - 忽略不存在的历史 key
  - 新增列自动追加

### 涉及文件

- `packages/hooks/src/use-table.ts`
- `packages/hooks/src/__tests__/use-table.spec.ts`

### 阶段出口

- `reloadColumns()` 不再丢失顺序
- 取消固定列后，重载列定义仍保持 `unFixed`
- 新增列/删除列场景通过 unit 测试

### 验证目标

- 列状态合并只依赖 `key`
- 语言切换或列工厂重算后，用户顺序不丢
- 默认固定列取消固定后不会被错误恢复

### Unit 测试案例

| 编号  | 用例                                               | 目标                   |
| ----- | -------------------------------------------------- | ---------------------- |
| U1-01 | `mergeColumnChecks` 保留 source 顺序               | 验证拖拽顺序不会丢失   |
| U1-02 | source 中 `fixed='unFixed'` 时保留取消固定语义     | 修复默认固定列回弹问题 |
| U1-03 | 历史状态中多余 key 被忽略                          | 兼容删除列             |
| U1-04 | 默认列中新 key 自动追加到末尾                      | 兼容新增列             |
| U1-05 | 未出现在 source 中的列回退默认 `checked` / `fixed` | 验证默认态回退逻辑     |
| U1-06 | `reloadColumns()` 使用当前状态重新合并默认列定义   | 覆盖实际重算入口       |

### E2E 测试案例

| 编号  | 用例                                       | 目标                |
| ----- | ------------------------------------------ | ------------------- |
| E1-01 | 在测试页拖拽列顺序后切换语言，顺序保持不变 | 验证真实页面链路    |
| E1-02 | 默认固定列取消固定后切换语言，仍保持未固定 | 验证 `unFixed` 语义 |

## 阶段 2：本地存储工具与用户维度隔离

### 实施内容

- 新增 `src/utils/table-column-state.ts`
- 扩展 `src/typings/storage.d.ts`
- 实现本地读写：
  - `readTableColumnState`
  - `writeTableColumnState`
  - `removeTableColumnState`
  - `serializeColumnChecks`
  - `normalizePersistedColumnState`
- 支持用户维度隔离：
  - 已登录用户使用 `userId`
  - 未登录时使用 `__anonymous__`
- 支持版本校验和失效处理

### 涉及文件

- `src/utils/table-column-state.ts`
- `src/utils/__tests__/table-column-state.spec.ts`
- `src/typings/storage.d.ts`

### 阶段出口

- storage 结构稳定
- 不同用户不会共享表格列配置
- 版本不一致时自动失效
- 非法远端数据可 normalize

### 验证目标

- 只持久化最小可序列化列状态
- 本地存储数据结构可向后演进
- 不同登录用户互不污染

### Unit 测试案例

| 编号  | 用例                                                | 目标             |
| ----- | --------------------------------------------------- | ---------------- |
| U2-01 | `serializeColumnChecks` 只输出 `key/checked/fixed`  | 保证序列化最小化 |
| U2-02 | `write` 后 `read` 能得到相同结果                    | 验证基础存取链路 |
| U2-03 | `remove` 后读取为空                                 | 验证删除逻辑     |
| U2-04 | 相同表 `id` 在不同 `userId` 下互不影响              | 验证用户隔离     |
| U2-05 | 版本不一致时返回空状态                              | 验证版本失效策略 |
| U2-06 | `normalizePersistedColumnState` 过滤未知 key        | 验证结构兼容     |
| U2-07 | `normalizePersistedColumnState` 修正非法 `fixed` 值 | 验证安全性       |
| U2-08 | 未登录用户使用 `__anonymous__` 命名空间             | 验证匿名隔离     |

### E2E 测试案例

| 编号  | 用例                                     | 目标           |
| ----- | ---------------------------------------- | -------------- |
| E2-01 | 用户 A 修改列设置并刷新，状态恢复        | 验证本地持久化 |
| E2-02 | 切换为用户 B 后，读取不到用户 A 的列状态 | 验证用户隔离   |
| E2-03 | 切回用户 A 后，用户 A 状态恢复           | 验证隔离稳定性 |

## 阶段 3：hook 层接入 storage 与 restoreStore

### 实施内容

- 在 `src/hooks/common/table.ts` 扩展 `UseNaiveTableOptions`
- 新增 `columnState` 配置
- 初始化时读取本地状态
- 调用 `restoreStore`
- 对结果做 normalize
- 将最终结果应用到 `columnChecks`
- 开启 `canPersist`，监听 `columnChecks` 自动落盘
- `restoreStore` 返回有效结果后回写本地缓存

### 涉及文件

- `src/hooks/common/table.ts`
- `src/hooks/common/__tests__/table-column-state-hook.spec.ts`

### 阶段出口

- 不配置 `columnState` 时，行为与当前版本一致
- 配置 `storage: true` 后，本地状态可恢复
- 配置 `restoreStore` 后，可覆盖默认恢复来源
- `restoreStore` 出错时不影响页面可用性

### 验证目标

- 功能默认关闭，确保兼容现有页面
- 恢复逻辑优先级清晰：默认列 -> 本地 -> `restoreStore` 最终结果
- 初始化阶段不会因为 watch 过早启动而覆盖已有缓存

### Unit 测试案例

| 编号  | 用例                                                | 目标              |
| ----- | --------------------------------------------------- | ----------------- |
| U3-01 | 未配置 `columnState` 时，hook 行为与原来一致        | 验证向后兼容      |
| U3-02 | 配置 `storage: true` 时，会从本地恢复状态           | 验证 storage 接入 |
| U3-03 | `restoreStore` 返回远端状态时，以远端为准           | 验证覆盖恢复语义  |
| U3-04 | `restoreStore` 返回 `undefined` 时保持默认态        | 验证空返回约定    |
| U3-05 | `restoreStore` 抛错时页面仍可正常使用               | 验证容错          |
| U3-06 | 恢复结束前 `canPersist=false`，不会把默认态写回本地 | 验证初始化防覆盖  |
| U3-07 | `restoreStore` 返回有效结果后会回写本地             | 验证本地同步      |

### E2E 测试案例

| 编号  | 用例                                         | 目标                  |
| ----- | -------------------------------------------- | --------------------- |
| E3-01 | 本地已有状态，页面打开后直接恢复             | 验证本地恢复链路      |
| E3-02 | 开启远端恢复后，以远端列状态为准             | 验证 restore override |
| E3-03 | 模拟远端接口失败后，页面仍正常展示           | 验证容错与回退        |
| E3-04 | 远端恢复成功后刷新页面，仍是远端恢复后的结果 | 验证回写本地          |

## 阶段 4：渲染就绪状态、阻塞策略与 reset 能力

### 实施内容

- 新增 `blockUntilRestored`
- 新增 `columnStateReady`
- 新增 `restoringColumnState`
- 新增 `resetColumnState`
- 当 `blockUntilRestored=true` 且异步恢复未完成时，`columns` 返回空数组
- 当 `blockUntilRestored=false` 时，允许先渲染默认/本地状态，恢复后热更新

### 涉及文件

- `src/hooks/common/table.ts`
- `src/hooks/common/__tests__/table-column-state-hook.spec.ts`
- `tests/e2e/table-column-state.spec.ts`

### 阶段出口

- 可以感知列状态是否就绪
- 可以控制是否阻塞表格列渲染
- 可以通过 reset 恢复默认列设置并清理缓存

### 验证目标

- 异步恢复期间不存在不可控的列闪烁
- 页面可以根据 `columnStateReady` 决定 UI 呈现
- reset 行为彻底、可重复

### Unit 测试案例

| 编号  | 用例                                                       | 目标             |
| ----- | ---------------------------------------------------------- | ---------------- |
| U4-01 | `blockUntilRestored=true` 时，恢复完成前 `columns` 为空    | 验证阻塞渲染策略 |
| U4-02 | `blockUntilRestored=false` 时，先返回默认/本地列，再热更新 | 验证非阻塞策略   |
| U4-03 | `columnStateReady` 随恢复完成正确切换                      | 验证就绪状态     |
| U4-04 | `restoringColumnState` 在异步恢复期间为真                  | 验证恢复中状态   |
| U4-05 | `resetColumnState()` 清理本地并回到默认列设置              | 验证 reset       |

### E2E 测试案例

| 编号  | 用例                                                  | 目标                  |
| ----- | ----------------------------------------------------- | --------------------- |
| E4-01 | 开启阻塞模式时，慢恢复期间不显示最终列配置            | 验证无闪烁            |
| E4-02 | 开启非阻塞模式时，页面先渲染默认/本地列，恢复后热更新 | 验证可选体验          |
| E4-03 | 点击 Reset 后恢复默认列设置并刷新仍保持默认           | 验证 reset 与本地清理 |

## 阶段 5：回归加固与结构变化验证

### 实施内容

- 覆盖新增列/删除列场景
- 覆盖语言切换场景
- 覆盖版本升级失效场景
- 补齐测试承载页对结构切换的支持
- 收敛文档与示例代码

### 涉及文件

- `packages/hooks/src/__tests__/use-table.spec.ts`
- `src/utils/__tests__/table-column-state.spec.ts`
- `src/hooks/common/__tests__/table-column-state-hook.spec.ts`
- `tests/e2e/table-column-state.spec.ts`
- `docs/table-column-state-design.md`

### 阶段出口

- 关键回归路径被自动化覆盖
- 结构变化与版本变化不引发异常
- 文档与实际行为一致

### 验证目标

- 功能在后续表格扩展时仍稳定可回归
- 多语言、版本升级、结构变化均可控

### Unit 测试案例

| 编号  | 用例                                          | 目标             |
| ----- | --------------------------------------------- | ---------------- |
| U5-01 | 语言切换时 `reloadColumns()` 保留当前用户顺序 | 验证 locale 回归 |
| U5-02 | 新增列后历史缓存可自动兼容                    | 验证向前兼容     |
| U5-03 | 删除列后历史缓存可被忽略                      | 验证向后兼容     |
| U5-04 | `version` 变更后缓存失效并回到默认态          | 验证版本治理     |

### E2E 测试案例

| 编号  | 用例                                           | 目标                 |
| ----- | ---------------------------------------------- | -------------------- |
| E5-01 | 修改列顺序后切换语言，状态仍保持               | 验证真实 locale 链路 |
| E5-02 | 通过测试页切换“包含额外列”的版本，旧状态可兼容 | 验证新增列           |
| E5-03 | 通过测试页切换“去掉某列”的版本，旧状态不报错   | 验证删除列           |
| E5-04 | 切换列状态版本号后，本地缓存失效并回到默认态   | 验证版本失效         |

## 阶段依赖关系

```txt
阶段 0 -> 阶段 1 -> 阶段 2 -> 阶段 3 -> 阶段 4 -> 阶段 5
```

说明：

- 阶段 0 未完成前，不建议开始写自动化测试用例
- 阶段 1 和阶段 2 是阶段 3 的基础
- 阶段 3 完成后才能稳定推进 e2e 主链路
- 阶段 4 和阶段 5 主要负责体验收敛与回归加固

## 每阶段发布建议

### 建议提交粒度

- 一个阶段至少对应一个独立 PR
- 若阶段过大，可拆成“功能 PR + 测试 PR”
- 每个 PR 必须附带对应阶段的验证结果

### 建议验收方式

- Code review 关注范围是否受控
- 先看 unit 测试覆盖纯逻辑
- 再看 e2e 是否覆盖真实链路
- 最后人工验证测试页关键交互

## 最低自动化覆盖要求

建议作为阶段完成门槛：

- 阶段 1：核心 merge 逻辑 100% 覆盖关键分支
- 阶段 2：storage 工具 100% 覆盖关键分支
- 阶段 3：restore 逻辑和异常分支全部覆盖
- 阶段 4：阻塞/非阻塞两套渲染策略均有 unit + e2e
- 阶段 5：回归场景全部自动化

## 最终交付判定

当以下条件全部成立时，可认为该功能稳定落地：

- 分阶段计划全部完成
- 所有阶段出口满足
- unit 测试覆盖核心逻辑与异常分支
- e2e 测试覆盖用户主链路与关键回归路径
- 文档与实际实现保持一致
- 真实测试页人工验证结果符合预期

若项目最终决定不保留本次测试基础设施，还需要额外满足：

- 已完成功能验收
- 已按 `docs/table-column-state-validation-cleanup.md` 清理临时验证资产
- 清理后项目仍能正常 `typecheck`、`build`

## 结论

推荐按“测试基础设施 -> 通用状态合并 -> 本地存储与用户隔离 -> hook 恢复接入 -> 渲染状态与 reset -> 回归加固”的顺序推进。

这种推进方式的优点是：

- 风险可控
- 每阶段都有明确产物
- 自动化测试能同步跟进
- 可以较稳定地逼近 `vxe-table` 期望语义
