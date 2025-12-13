# my-stats 插件架构与用法

本文件解释 `my-stats-backend`、`my-stats-client`、`my-stats-frontend` 三者的关系、架构设计原因，以及在应用中的使用方法与排错要点。文中提供精确代码引用，便于定位到项目中的实现。

## 分层关系与职责
- 后端插件 `my-stats-backend`
  - 提供 HTTP 接口，挂载到服务端的统一前缀 `\`/api/my-stats`。
  - 定义路由与鉴权策略，返回统计数据与健康检查。
  - 关键实现：`plugins/my-stats-backend/src/plugin.ts:5`、`plugins/my-stats-backend/src/plugin.ts:12-19`、`plugins/my-stats-backend/src/plugin.ts:25-27`。
- 前端客户端 `my-stats-client`
  - 封装请求后端的逻辑，负责通过 Discovery/Identity/Fetch 服务发现地址与附带凭证。
  - 对外暴露类型安全的方法，如 `getStats()`。
  - 关键实现：`plugins/my-stats-client/src/index.ts:16-28`。
- 前端模块 `my-stats-frontend`
  - 定义前端 API 引用与页面注册，通过蓝图系统（ApiBlueprint/PageBlueprint）完成依赖注入与路由绑定。
  - 页面使用 `useApi(statsApiRef)` 调用客户端，渲染统计数据。
  - 关键实现：`plugins/my-stats-frontend/src/api.ts:7`、`plugins/my-stats-frontend/src/module.ts:6-13`、`plugins/my-stats-frontend/src/module.ts:15-20`、`plugins/my-stats-frontend/src/components/StatsPage.tsx:10`、`plugins/my-stats-frontend/src/components/StatsPage.tsx:14-19`。

## 为什么要这样分层
- 关注点分离与可维护性
  - 后端只关心业务与接口安全；前端客户端聚焦通信与鉴权；页面关注展示与交互。
- 一致的插件模式
  - 与 Catalog 等官方插件保持一致的组织方式，降低学习与迁移成本。
- 类型安全与依赖注入
  - 通过 `ApiRef` 明确能力边界；蓝图系统在装配时注入实现，提升可测试性与复用性。
- 安全与可观测
  - 统一的 `httpRouter` 前缀与 `addAuthPolicy` 策略让权限清晰，日志位置集中。

## 架构细节与代码位置
- 后端路由与鉴权
  - 插件 ID：`plugins/my-stats-backend/src/plugin.ts:5`。
  - 路由：健康检查 `plugins/my-stats-backend/src/plugin.ts:12-14`，统计接口 `plugins/my-stats-backend/src/plugin.ts:15-23`。
  - 挂载与策略：`plugins/my-stats-backend/src/plugin.ts:25-27`。
- 前端 API 与模块
  - API 引用：`plugins/my-stats-frontend/src/api.ts:7`。
  - 客户端注入：`plugins/my-stats-frontend/src/module.ts:6-13`（通过 Discovery/Identity/Fetch 注入 `MyStatsClient`）。
  - 页面注册：`plugins/my-stats-frontend/src/module.ts:15-20`（路径 `\`/stats`）。
  - 页面调用：`plugins/my-stats-frontend/src/components/StatsPage.tsx:10`、`plugins/my-stats-frontend/src/components/StatsPage.tsx:14-19`。
- 后端装配入口
  - 在 `packages/backend/src/index.ts:27-29` 将插件加入后端。

## 典型调用流程
1. 页面加载 `StatsPage`（路径 `\`/stats`）。
2. 组件通过 `useApi(statsApiRef)` 获取 API 实现：`plugins/my-stats-frontend/src/components/StatsPage.tsx:10`。
3. 调用 `getStats()` 触发客户端请求：`plugins/my-stats-frontend/src/components/StatsPage.tsx:14-19`。
4. 客户端发现服务地址并附带凭证：`plugins/my-stats-client/src/index.ts:17-23`。
5. 服务端路由返回 JSON：`plugins/my-stats-backend/src/plugin.ts:15-23`。

## 在应用中启用
- 后端
  - 确保已在装配入口注册：`packages/backend/src/index.ts:27-29`。
  - 启动后端：在工作区使用 `yarn workspace backend start`（具体脚本以仓库配置为准）。
- 前端
  - 确保应用依赖了 `my-stats-frontend` 与 `my-stats-client` 包。
  - 在新前端模块化系统中，模块通常通过依赖被自动发现与装配；如需显式注册，请在应用模块清单中加入 `my-stats` 对应的前端模块导出。

## 接口与页面验证
- 后端接口
  - `curl -i http://localhost:7007/api/my-stats/health` 应返回 `200` 与 `{ ok: true }`。
  - `curl -i http://localhost:7007/api/my-stats/stats` 应返回 `200` 与统计数据。
- 前端页面
  - 打开 `\`/stats`，应显示 Services/APIs/Docs 三项统计。

## 常见问题与排错
- 503 Service Unavailable
  - 后端未启动或插件未装配：检查 `packages/backend/src/index.ts:27-29`。
  - 路由未正确挂载：后端应使用相对挂载 `httpRouter.use(router)`（见 `plugins/my-stats-backend/src/plugin.ts:25`），统一前缀由框架提供。
  - 鉴权策略不放行：若需要匿名访问，确保添加策略（见 `plugins/my-stats-backend/src/plugin.ts:26-27`）。
  - 前端发现失败：客户端必须使用 `getBaseUrl('my-stats')`（见 `plugins/my-stats-client/src/index.ts:17`），插件 ID 与后端一致。
- 401/403 鉴权错误
  - 如启用鉴权，客户端需通过 Identity 注入 `Authorization: Bearer <token>`（见 `plugins/my-stats-client/src/index.ts:19-22`）。
- 前端页面空白
  - 检查模块注册与页面路径（`plugins/my-stats-frontend/src/module.ts:15-20`），以及组件调用逻辑（`plugins/my-stats-frontend/src/components/StatsPage.tsx:14-19`）。

## 设计扩展建议
- 抽取通用前端包
  - 如需进一步对齐 Catalog 的分层，可新增 `plugin-my-stats-frontend-react` 包，暴露 `StatsApi` 与通用 React 组件，便于其他插件复用。
- 后端扩展点
  - 提供数据来源配置或注册处理扩展点，允许替换统计数据的采集逻辑。
- 指标与监控
  - 在后端增加请求计数与时延日志，或导出 Prometheus 指标，提升可观测性。

## 参考代码片段
- 后端路由（摘要）
```ts
// plugins/my-stats-backend/src/plugin.ts
router.get('/stats', (_req, res) => {
  const payload = { services: 12, apis: 5, docs: 23 };
  res.status(200).json(payload);
});
```
- 客户端调用（摘要）
```ts
// plugins/my-stats-client/src/index.ts
const baseUrl = await this.discoveryApi.getBaseUrl('my-stats');
const res = await this.fetchApi.fetch(`${baseUrl}/stats`, { headers });
```
- 前端模块注册（摘要）
```ts
// plugins/my-stats-frontend/src/module.ts
const StatsApiExt = ApiBlueprint.make({ /* ... */ });
const StatsPageExt = PageBlueprint.make({ /* ... */ });
export default createFrontendModule({ pluginId: 'my-stats', extensions: [StatsApiExt, StatsPageExt] });
```

