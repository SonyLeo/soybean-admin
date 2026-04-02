# 表格列设置功能验证资产清理说明

## 文档目的

本文档用于记录本次“表格列设置持久化”功能验证过程中引入的临时测试资产，方便在功能验证完成后按步骤移除，避免对原项目长期结构造成影响。

适用场景：

- 功能已经验证通过
- 项目决定不保留本次新增的测试基础设施
- 需要把仓库恢复为接近原始的无测试方案状态

相关文档：

- `docs/table-column-state-design.md`
- `docs/table-column-state-implementation-plan.md`

## 说明原则

本次为功能验证而引入的内容分为两类：

### 1. 临时验证资产

这些内容默认在功能验收完成后可以移除：

- 单元测试基础设施
- E2E 测试基础设施
- 测试专用页面
- 测试专用路由
- 测试脚本
- 测试 setup 文件

### 2. 功能正式实现

这些内容不属于清理范围，应保留：

- 表格列状态持久化的正式业务实现
- 正式功能文档
- 与持久化功能直接相关的生产代码

## 当前临时资产清单

以下内容是目前为了阶段 0 验证而引入的临时资产。

## 1. 依赖

位于：

- `package.json`

临时新增依赖：

- `vitest`
- `@vitest/coverage-v8`
- `@vue/test-utils`
- `happy-dom`
- `@playwright/test`

## 2. 脚本

位于：

- `package.json`

临时新增脚本：

- `test:unit`
- `test:unit:watch`
- `test:e2e`
- `test:e2e:ui`

## 3. 测试配置文件

临时新增：

- `vitest.config.ts`
- `playwright.config.ts`

## 4. 测试 setup 文件

临时新增：

- `tests/setup/unit.setup.ts`

## 5. 测试文件

临时新增：

- `src/test-pages/table-column-state/index.spec.ts`
- `tests/e2e/table-column-state.spec.ts`

## 6. 测试承载页

临时新增：

- `src/test-pages/table-column-state/index.vue`

说明：

- 该页面仅用于 smoke 与回归验证
- 不属于正式业务页面
- 若测试基础设施移除，该页面应一并删除

## 7. 测试路由接入

涉及文件：

- `src/router/routes/index.ts`

当前新增内容：

- `test` 模式下的 `dev-table-column-state` 自定义路由
- 对测试页 view 的动态引入

说明：

- 这部分仅为测试承载页服务
- 删除测试页时应同步回退

## 8. 为测试兼容所做的配置调整

涉及文件：

- `vite.config.ts`
- `tsconfig.json`

当前新增内容：

- `vite.config.ts` 中基于 `PLAYWRIGHT` 环境变量控制 `server.open`
- `tsconfig.json` 中加入 `vitest/globals`

说明：

- 如果完全移除测试方案，需要同步回退

## 建议移除时机

建议仅在以下条件全部满足后执行清理：

- 表格列设置持久化功能已完成开发
- 关键功能已人工验证通过
- 关键路径已通过阶段性自动化验证
- 团队已确认不保留本次测试方案

若后续准备保留单测或 e2e 作为长期能力，则不应执行本清理文档。

## 推荐移除顺序

为了降低误删和回归风险，建议按以下顺序执行。

## 第一步：移除测试页与测试路由

删除：

- `src/test-pages/table-column-state/index.vue`

回退：

- `src/router/routes/index.ts`

目标：

- 清除对生产路由和页面结构的测试性侵入

## 第二步：移除测试文件与 setup

删除：

- `src/test-pages/table-column-state/index.spec.ts`
- `tests/e2e/table-column-state.spec.ts`
- `tests/setup/unit.setup.ts`

如果 `tests/` 目录已空，可一并删除：

- `tests/`

## 第三步：移除测试配置文件

删除：

- `vitest.config.ts`
- `playwright.config.ts`

## 第四步：回退项目配置

回退：

- `tsconfig.json` 中的 `vitest/globals`
- `vite.config.ts` 中为 Playwright 服务的 `server.open` 条件控制

目标：

- 恢复到更接近原项目的基础配置

## 第五步：回退 package.json

移除脚本：

- `test:unit`
- `test:unit:watch`
- `test:e2e`
- `test:e2e:ui`

移除依赖：

- `vitest`
- `@vitest/coverage-v8`
- `@vue/test-utils`
- `happy-dom`
- `@playwright/test`

## 第六步：重新安装依赖并校验

执行：

```bash
pnpm install
pnpm typecheck
pnpm build:test
```

目标：

- 确保依赖树已正确回收
- 确保移除测试基础设施后不影响正式功能构建

## 推荐清理核对表

执行清理时，建议逐项核对：

- 测试专用页面已删除
- 测试专用路由已回退
- `tests/` 目录中的临时内容已删除
- `vitest.config.ts` 已删除
- `playwright.config.ts` 已删除
- `package.json` 中测试脚本已删除
- `package.json` 中测试依赖已删除
- `tsconfig.json` 已恢复
- `vite.config.ts` 已恢复
- `pnpm install` 后 lockfile 正常更新
- `typecheck` 正常
- `build:test` 正常

## 清理后的最小验证

完成清理后至少应执行：

```bash
pnpm typecheck
pnpm build:test
```

如果有条件，建议额外验证：

- 登录页可正常访问
- 首页可正常访问
- 路由初始化无异常

## 风险提示

### 1. 不要误删正式功能代码

以下内容不属于临时验证资产：

- 表格列状态持久化相关的正式实现
- 正式功能 helper
- 正式功能文档

清理前应确认相关文件是否仍被生产代码引用。

### 2. 优先删测试页，再删测试配置

如果先删配置、后删测试页，可能出现残留导入或路由引用，导致构建报错。

### 3. package.json 修改后要同步更新 lockfile

否则会造成依赖树和脚本状态不一致。

## 若团队后续决定保留测试方案

如果团队最终认为这套测试基础设施有长期价值，则不应执行本清理文档。

此时建议：

- 将测试页替换为更规范的测试 fixture 页面
- 将 smoke 测试升级为正式回归测试
- 将文档从“临时验证资产”升级为“正式测试规范”

## 结论

本次新增的测试基础设施和测试承载页是为了功能验证服务的临时资产，不是默认要长期保留的项目能力。

功能完全验证后，如果决定恢复原项目的无测试方案结构，应按本文档顺序清理，以确保：

- 删除范围清晰
- 不误伤正式功能实现
- 清理后仓库仍可正常构建和运行
