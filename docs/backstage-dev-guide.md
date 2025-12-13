# Backstage 开发文档

## 目标与范围

- 概览架构与仓库结构，明确前后端插件的开发模型
- 详述插件、页面、API 的开发流程与代码骨架（新前后端系统与经典模式）
- 涵盖配置、实体模型、常用扩展点、构建与发布实践
- 基于实际项目源码分析插件、页面和 API 的实现细节

## 插件概念与架构

- 插件是 Backstage 的功能单元，负责提供页面、API、路由与处理逻辑，可前后端协作，也可单独存在。
- 插件由“前端插件”和“后端插件”组成，分别运行在浏览器与服务器端，通过 API 和约定进行通信。
- 新前后端系统以“蓝图（Blueprint）/模块（Module）/扩展点（ExtensionPoint）”实现可组合架构；经典模式以 `createPlugin` + `RouteRef` 组合页面。
- 后端采用 `createBackend` 装配模型，插件彼此通过核心服务（`coreServices`）和扩展点进行依赖注入与协作。

### 插件的组成

- 页面与路由：在前端提供路由绑定与页面组件（经典模式：`RoutableExtension`；新前端：`PageBlueprint`）。
- API：前端通过 `ApiRef` 定义接口、由工厂提供实现，后端通过路由提供数据或动作。
- 扩展点：插件之间的可协作接口，后端以 “扩展点” 模式向宿主插件注入能力（如 Catalog 处理器）。
- 配置：插件使用应用配置（`app-config*.yaml`）读取其运行所需的参数（如鉴权、集成、存储）。

### 插件生命周期（简化）

- 安装与注册：在前端 `createApp` 的路由与绑定、在后端 `createBackend` 中 `backend.add()`。
- 初始化：后端插件 `register(env)` 中的 `env.registerInit()` 执行依赖注入与路由安装；前端模块注册页面与 API。
- 运行与交互：前端页面通过 API 调用后端路由，后端插件处理请求、返回数据或执行动作。
- 扩展与复用：通过扩展点或外部路由绑定实现插件之间的协作与组合。

### 插件间协作方式

- 路由绑定：使用 `bindRoutes` 将一个插件的“外部路由”绑定到另一个插件的路由引用（如 Catalog 触达 Scaffolder）。
- 扩展点：后端模块使用 `createBackendModule` 向宿主插件注入行为（如向 Catalog 插件注册处理器）。
- API 依赖：前端通过 `ApiRef` 引用其他模块提供的接口实现。

### 新旧两套前端系统对比

- 经典模式：基于 `@backstage/core-plugin-api`，使用 `createPlugin`、`createRoutableExtension` 与 `RouteRef`，构建清晰但较“插件中心”的页面。
- 新前端系统：基于 `@backstage/frontend-plugin-api` 与蓝图，将页面与 API 作为“前端模块”安装，强调组合性与解耦，更适合大规模模块化扩展。

## 项目与仓库结构

- 应用与插件以 Yarn workspaces 管理，TypeScript 编写
- 常见目录
  - `packages/app` - 前端应用入口，包含路由、页面组件和 API 配置
  - `packages/backend` - 后端应用入口，包含插件注册和服务器配置
  - `plugins/*` - 自定义前后端插件与模块包
  - `app-config*.yaml` - 应用配置文件
  - `examples/` - 示例实体、模板和组织数据
  - `docs/` - 项目文档

### 项目结构示例

```text
my-backstage-app/
├── packages/
│   ├── app/                    # 前端应用
│   │   ├── src/
│   │   │   ├── App.tsx         # 应用主入口，路由配置
│   │   │   ├── apis.ts         # API 工厂配置
│   │   │   └── components/     # 自定义组件
│   │   │       ├── catalog/    # 实体页面组件
│   │   │       ├── Root/       # 根布局组件
│   │   │       └── search/     # 搜索页面组件
│   │   └── package.json
│   └── backend/                # 后端应用
│       ├── src/
│       │   └── index.ts        # 后端入口，插件注册
│       └── package.json
├── plugins/                    # 自定义插件目录
├── app-config.yaml             # 应用配置
└── package.json                # 根 package.json
```

## 开发环境

### 初始化项目

```bash
# 创建新的 Backstage 应用
npx @backstage/create-app

# 安装依赖
yarn install
```

### 启动开发服务器

```bash
# 同时启动前端和后端（推荐）
yarn start

# 或者分别启动
yarn workspace app start        # 前端：http://localhost:3000
yarn workspace backend start    # 后端：http://localhost:7007
```

### 创建新插件

```bash
# 创建前端插件
yarn new --select plugin

# 创建后端插件
yarn new --select backend-plugin

# 创建后端模块
yarn new --select backend-module
```

### 构建项目

```bash
# 构建所有包
yarn build:all

# 构建前端
yarn workspace app build

# 构建后端
yarn workspace backend build
```

## 项目实际使用的插件分析

### 前端插件列表

基于 `packages/app/package.json`，当前项目使用的前端插件包括：

1. **核心插件**
   - `@backstage/plugin-catalog` - 软件目录插件，管理所有软件实体
   - `@backstage/plugin-catalog-react` - Catalog React 组件库
   - `@backstage/plugin-catalog-graph` - 目录关系图可视化
   - `@backstage/plugin-catalog-import` - 目录导入功能

2. **文档与 API**
   - `@backstage/plugin-api-docs` - API 文档浏览
   - `@backstage/plugin-techdocs` - 技术文档系统
   - `@backstage/plugin-techdocs-react` - TechDocs React 组件

3. **开发工具**
   - `@backstage/plugin-scaffolder` - 软件模板脚手架
   - `@backstage/plugin-search` - 搜索功能
   - `@backstage/plugin-search-react` - 搜索 React 组件

4. **组织与权限**
   - `@backstage/plugin-org` - 组织管理
   - `@backstage/plugin-permission-react` - 权限管理
   - `@backstage/plugin-user-settings` - 用户设置

5. **基础设施**
   - `@backstage/plugin-kubernetes` - Kubernetes 集成
   - `@backstage/plugin-notifications` - 通知系统
   - `@backstage/plugin-signals` - 信号系统

### 后端插件列表

基于 `packages/backend/src/index.ts` 和 `packages/backend/package.json`：

1. **核心后端插件**
   - `@backstage/plugin-app-backend` - 应用后端服务
   - `@backstage/plugin-proxy-backend` - 代理后端
   - `@backstage/plugin-catalog-backend` - 目录后端服务

2. **认证与权限**
   - `@backstage/plugin-auth-backend` - 认证后端
   - `@backstage/plugin-auth-backend-module-guest-provider` - 访客认证提供者
   - `@backstage/plugin-permission-backend` - 权限后端
   - `@backstage/plugin-permission-backend-module-allow-all-policy` - 允许所有策略

3. **功能插件**
   - `@backstage/plugin-scaffolder-backend` - 脚手架后端
   - `@backstage/plugin-techdocs-backend` - TechDocs 后端
   - `@backstage/plugin-search-backend` - 搜索后端
   - `@backstage/plugin-kubernetes-backend` - Kubernetes 后端
   - `@backstage/plugin-notifications-backend` - 通知后端
   - `@backstage/plugin-signals-backend` - 信号后端

4. **搜索模块**
   - `@backstage/plugin-search-backend-module-pg` - PostgreSQL 搜索引擎
   - `@backstage/plugin-search-backend-module-catalog` - Catalog 搜索收集器
   - `@backstage/plugin-search-backend-module-techdocs` - TechDocs 搜索收集器

## 前端插件：新前端系统

- 核心包 @backstage/frontend-plugin-api, @backstage/frontend-defaults
- 扩展通过蓝图创建并以前端模块安装到应用

### 页面扩展

```ts
/** 引入页面蓝图与前端模块工厂，用于声明页面扩展并安装到应用 */
import { PageBlueprint, createFrontendModule } from '@backstage/frontend-plugin-api'

/** 基于蓝图创建页面扩展实例 */
const MyPage = PageBlueprint.make({
  /** 配置页面扩展所需的参数 */
  params: {
    /** 页面在应用中的路由路径 */
    path: '/my-page',
    /** 懒加载页面组件并返回 React 元素 */
    loader: () => import('./components/MyPage').then(m => <m.MyPage />),
  },
})

/** 声明并导出前端模块，提供页面扩展 */
export default createFrontendModule({
  /** 所属插件 ID，用于在应用中归类 */
  pluginId: 'my-plugin',
  /** 模块暴露的扩展列表，这里安装我们创建的页面 */
  extensions: [MyPage],
})
```

#### 开发细节与模式选择

- 模块化安装：一个前端模块可同时提供页面与 API 扩展，按需组合到应用，减少耦合。
- 懒加载策略：`loader` 支持动态导入与代码拆分，建议页面级懒加载以优化首屏。
- API 消费：通过 `createApiRef` + `useApi()` 获取实现，避免直接依赖具体类，便于替换与测试。
- 组合扩展：同一 `pluginId` 下可声明多个扩展（页面、API、卡片），形成可复用的功能集。
- 与经典模式共存：迁移期间可并行使用两套系统，逐步将经典页面改造成模块扩展。

### 前端 API 扩展

```ts
/** 引入 API 蓝图、前端模块工厂与 ApiRef 工具 */
import { ApiBlueprint, createFrontendModule, createApiRef } from '@backstage/frontend-plugin-api'

/** 定义前端 API 的 TypeScript 接口 */
export interface ExampleApi {
  /** 声明 API 方法与返回类型 */
  getExample(): { example: string }
}

/** 创建 ApiRef，作为依赖注入与消费的标识 */
export const exampleApiRef = createApiRef<ExampleApi>({ id: 'plugin.example' })

/** 提供接口的默认实现类 */
class DefaultExampleApi implements ExampleApi {
  /** 实现接口方法 */
  getExample() {
    /** 返回示例数据 */
    return { example: 'Hello World' }
  }
}

/** 基于 API 蓝图创建 API 扩展 */
const ExampleApiExt = ApiBlueprint.make({
  /** 通过回调定义蓝图参数 */
  params: defineParams =>
    /** 提供工厂函数与 ApiRef 以注册实现 */
    defineParams({ factory: () => new DefaultExampleApi(), apiRef: exampleApiRef }),
})

/** 声明并导出前端模块，提供 API 扩展 */
export default createFrontendModule({
  /** 模块所属插件 ID */
  pluginId: 'example',
  /** 模块暴露的扩展列表，安装我们创建的 API 扩展 */
  extensions: [ExampleApiExt],
})
```

## 前端插件：经典模式

- 核心包 @backstage/core-plugin-api
- 通过 RouteRef 与 RoutableExtension 在应用中路由

```ts
/** 经典前端模式下的路由引用声明文件 */
// src/routes.ts
/** 引入创建路由引用的工具 */
import { createRouteRef } from '@backstage/core-plugin-api'
/** 定义路由引用，赋予唯一 id */
export const rootRouteRef = createRouteRef({ id: 'example-root' })
```

```ts
/** 经典前端插件的主入口 */
// src/plugin.ts
/** 引入插件工厂与可路由扩展工厂 */
import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api'
/** 引入路由引用以挂载页面 */
import { rootRouteRef } from './routes'

/** 创建经典前端插件 */
export const examplePlugin = createPlugin({
  /** 插件唯一标识 */
  id: 'example',
  /** 声明插件对外暴露的路由引用 */
  routes: { root: rootRouteRef },
})

/** 通过插件提供一个可路由的页面扩展 */
export const ExamplePage = examplePlugin.provide(
  /** 定义扩展的细节 */
  createRoutableExtension({
    /** 扩展名称 */
    name: 'ExamplePage',
    /** 懒加载页面组件 */
    component: () => import('./components/ExampleComponent').then(m => m.ExampleComponent),
    /** 将页面挂载到声明的路由位置 */
    mountPoint: rootRouteRef,
  }),
)
```

### 路由与导航集成示例

- 在应用侧的 `createApp` 中通过 `FlatRoutes` 将经典模式的 `RoutableExtension` 绑定到具体路由；
- 使用 `bindRoutes` 将插件间的外部路由对接（如 Catalog → Scaffolder、TechDocs），实现跨插件跳转；
- 导航在 Root 侧边栏统一配置，建议将 Catalog、Docs、APIs、Create、Search 作为一级入口。

## 后端插件：新后端系统

- 核心包 @backstage/backend-plugin-api, @backstage/backend-defaults
- 通过依赖注入与核心服务装配路由与功能

```ts
/** 新后端系统中的后台插件入口 */
// src/plugin.ts
/** 引入后台插件工厂与核心服务引用 */
import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api'
/** 引入插件自定义路由的工厂函数 */
import { createRouter } from './service/router'

/** 创建后端插件 */
export const examplePlugin = createBackendPlugin({
  /** 插件唯一标识，用于装配 */
  pluginId: 'example',
  /** 注册插件的初始化逻辑 */
  register(env) {
    /** 声明一个初始化单元（Init），在后端启动时执行 */
    env.registerInit({
      /** 声明所需依赖：HTTP 路由与日志服务 */
      deps: { httpRouter: coreServices.httpRouter, logger: coreServices.logger },
      /** 初始化函数，注入依赖实例 */
      async init({ httpRouter, logger }) {
        /** 安装插件路由到 HTTP 服务 */
        httpRouter.use(await createRouter({ logger }))
        /** 为健康检查路由添加匿名访问策略 */
        httpRouter.addAuthPolicy({ path: '/health', allow: 'unauthenticated' })
      },
    })
  },
})
```

```ts
/** 插件路由工厂，返回可挂载的 Express 路由 */
// src/service/router.ts
/** 引入 Express 库 */
import express from 'express'
/** 引入日志类型，以便类型标注 */
import { Logger } from 'winston'

/** 路由工厂的入参类型，包含日志实例 */
type RouterOptions = { logger: Logger }

/** 暴露异步工厂函数，返回 Express 路由 */
export async function createRouter(options: RouterOptions): Promise<express.Router> {
  /** 创建新的路由实例 */
  const router = express.Router()
  /** 定义健康检查 GET 路由 */
  router.get('/health', (_, res) => {
    /** 记录健康检查访问日志 */
    options.logger.info('PONG')
    /** 返回健康状态 JSON */
    res.json({ status: 'ok' })
  })
  /** 返回构建好的路由以供安装 */
  return router
}
```

### 后端开发细节

- HTTP 路由前缀：建议统一以 `/api/<plugin>` 作为后端插件路由前缀，便于代理与权限控制。
- 鉴权策略：默认路由需鉴权；通过 `httpRouter.addAuthPolicy({ path, allow: 'unauthenticated' })` 开放健康检查或公共信息。
- 日志规范：关键请求进入、成功、失败均输出日志，便于排查；日志中包含 `pluginId` 与路径以快速定位。
- 模块化扩展：优先通过模块扩展宿主插件（如 Catalog、Scaffolder、Search），减少改动宿主插件本体。

### Scaffolder 自定义动作（后端模块）示例

```ts
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node';

export const scaffolderModuleHello = createBackendModule({
  pluginId: 'scaffolder',
  moduleId: 'hello-action',
  register(env) {
    env.registerInit({
      deps: { actions: scaffolderActionsExtensionPoint, logger: coreServices.logger },
      async init({ actions, logger }) {
        actions.addAction({
          id: 'org:hello',
          description: 'Print hello message',
          async handler(ctx) {
            const name = ctx.input?.name ?? 'Backstage';
            logger.info(`Hello ${name}`);
            ctx.output('message', `Hello ${name}`);
          },
        });
      },
    });
  },
});
```

说明：该模块把一个简单动作注册到 Scaffolder，模板可调用 `org:hello` 并在任务输出看到 `message`。

### 权限与鉴权实践

- 权限后端：安装 `@backstage/plugin-permission-backend` 与策略模块（如 `-allow-all-policy`）后生效；生产环境建议自定义策略模块。
- 自定义策略（示例）：

```ts
import { createBackendModule } from '@backstage/backend-plugin-api';
import { permissionPolicyExtensionPoint, AuthorizeResult } from '@backstage/plugin-permission-node';

export const permissionModulePolicy = createBackendModule({
  pluginId: 'permission',
  moduleId: 'custom-policy',
  register(env) {
    env.registerInit({
      deps: { policy: permissionPolicyExtensionPoint },
      async init({ policy }) {
        policy.setPolicy(async (_request) => ({ result: AuthorizeResult.ALLOW }));
      },
    });
  },
});
```

说明：示例将所有请求允许，通过 `AuthorizeResult` 返回不同结果可实现细粒度控制；生产应根据用户身份/资源/动作进行判定。

### 搜索后端与收集器建议

- 引擎选择：本地开发可用 PG 模块，生产建议使用托管 PG 实例并开启索引维护任务。
- 收集器扩展：Catalog 与 TechDocs 收集器覆盖常见来源；可自定义收集器抓取内部系统元数据并入索引。
- 索引字段：为常搜字段（名称、类型、owner、system、tags）建立索引并规范化，提升查询与结果质量。

### 后端装配

```ts
/** 后端应用装配入口 */
// packages/backend/src/index.ts
/** 引入后端装配工厂 */
import { createBackend } from '@backstage/backend-defaults'

/** 创建后端实例 */
const backend = createBackend()
/** 安装官方 Catalog 后端插件 */
backend.add(import('@backstage/plugin-catalog-backend'))
/** 安装组织自定义的示例后端插件 */
backend.add(import('@org/plugin-example-backend'))
/** 启动后端服务 */
backend.start()
```

### 后端模块扩展点

```ts
/** 引入后端模块工厂与核心服务 */
import { createBackendModule, coreServices } from '@backstage/backend-plugin-api'
/** 引入 Catalog 处理扩展点 */
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node'

/** 创建面向 Catalog 插件的后端模块 */
export const catalogModuleExample = createBackendModule({
  /** 目标插件 ID（要扩展的宿主） */
  pluginId: 'catalog',
  /** 模块自身 ID */
  moduleId: 'example-custom-processor',
  /** 注册模块的初始化逻辑 */
  register(env) {
    /** 注册一个初始化单元 */
    env.registerInit({
      /** 声明依赖扩展点与日志服务 */
      deps: { catalog: catalogProcessingExtensionPoint, logger: coreServices.logger },
      /** 初始化函数注入依赖 */
      async init({ catalog, logger }) {
        /** 向 Catalog 注册自定义处理器 */
        catalog.addProcessor({
          /** 处理器名称 */
          getProcessorName() {
            /** 返回处理器标识 */
            return 'example-processor'
          },
        })
      },
    })
  },
})
```

## 页面与路由系统

### 应用路由配置

基于 `packages/app/src/App.tsx`，应用使用 React Router 进行路由管理：

```65:101:packages/app/src/App.tsx
const routes = (
  <FlatRoutes>
    <Route path="/" element={<Navigate to="catalog" />} />
    <Route path="/catalog" element={<CatalogIndexPage />} />
    <Route
      path="/catalog/:namespace/:kind/:name"
      element={<CatalogEntityPage />}
    >
      {entityPage}
    </Route>
    <Route path="/docs" element={<TechDocsIndexPage />} />
    <Route
      path="/docs/:namespace/:kind/:name/*"
      element={<TechDocsReaderPage />}
    >
      <TechDocsAddons>
        <ReportIssue />
      </TechDocsAddons>
    </Route>
    <Route path="/create" element={<ScaffolderPage />} />
    <Route path="/api-docs" element={<ApiExplorerPage />} />
    <Route
      path="/catalog-import"
      element={
        <RequirePermission permission={catalogEntityCreatePermission}>
          <CatalogImportPage />
        </RequirePermission>
      }
    />
    <Route path="/search" element={<SearchPage />}>
      {searchPage}
    </Route>
    <Route path="/settings" element={<UserSettingsPage />} />
    <Route path="/catalog-graph" element={<CatalogGraphPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
  </FlatRoutes>
);
```

### 路由说明

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 重定向到 `/catalog` | 首页重定向 |
| `/catalog` | `CatalogIndexPage` | 目录索引页 |
| `/catalog/:namespace/:kind/:name` | `CatalogEntityPage` | 实体详情页 |
| `/docs` | `TechDocsIndexPage` | 文档索引页 |
| `/docs/:namespace/:kind/:name/*` | `TechDocsReaderPage` | 文档阅读页 |
| `/create` | `ScaffolderPage` | 创建组件页面 |
| `/api-docs` | `ApiExplorerPage` | API 文档浏览 |
| `/catalog-import` | `CatalogImportPage` | 目录导入（需权限） |
| `/search` | `SearchPage` | 搜索页面 |
| `/settings` | `UserSettingsPage` | 用户设置 |
| `/catalog-graph` | `CatalogGraphPage` | 目录关系图 |
| `/notifications` | `NotificationsPage` | 通知页面 |

### 插件路由绑定

应用通过 `bindRoutes` 配置插件间的路由关联：

```41:63:packages/app/src/App.tsx
const app = createApp({
  apis,
  bindRoutes({ bind }) {
    bind(catalogPlugin.externalRoutes, {
      createComponent: scaffolderPlugin.routes.root,
      viewTechDoc: techdocsPlugin.routes.docRoot,
      createFromTemplate: scaffolderPlugin.routes.selectedTemplate,
    });
    bind(apiDocsPlugin.externalRoutes, {
      registerApi: catalogImportPlugin.routes.importPage,
    });
    bind(scaffolderPlugin.externalRoutes, {
      registerComponent: catalogImportPlugin.routes.importPage,
      viewTechDoc: techdocsPlugin.routes.docRoot,
    });
    bind(orgPlugin.externalRoutes, {
      catalogIndex: catalogPlugin.routes.catalogIndex,
    });
  },
  components: {
    SignInPage: props => <SignInPage {...props} auto providers={['guest']} />,
  },
});
```

### 实体页面结构

实体页面通过 `EntityLayout` 和 `EntitySwitch` 实现条件渲染，支持不同类型的实体显示不同的标签页：

```399:410:packages/app/src/components/catalog/EntityPage.tsx
export const entityPage = (
  <EntitySwitch>
    <EntitySwitch.Case if={isKind('component')} children={componentPage} />
    <EntitySwitch.Case if={isKind('api')} children={apiPage} />
    <EntitySwitch.Case if={isKind('group')} children={groupPage} />
    <EntitySwitch.Case if={isKind('user')} children={userPage} />
    <EntitySwitch.Case if={isKind('system')} children={systemPage} />
    <EntitySwitch.Case if={isKind('domain')} children={domainPage} />

    <EntitySwitch.Case>{defaultEntityPage}</EntitySwitch.Case>
  </EntitySwitch>
);
```

#### Service 类型组件页面

```146:189:packages/app/src/components/catalog/EntityPage.tsx
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      {overviewContent}
    </EntityLayout.Route>

    <EntityLayout.Route path="/ci-cd" title="CI/CD">
      {cicdContent}
    </EntityLayout.Route>

    <EntityLayout.Route
      path="/kubernetes"
      title="Kubernetes"
      if={isKubernetesAvailable}
    >
      <EntityKubernetesContent />
    </EntityLayout.Route>

    <EntityLayout.Route path="/api" title="API">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityProvidedApisCard />
        </Grid>
        <Grid item md={6}>
          <EntityConsumedApisCard />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/dependencies" title="Dependencies">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item md={6}>
          <EntityDependsOnComponentsCard variant="gridItem" />
        </Grid>
        <Grid item md={6}>
          <EntityDependsOnResourcesCard variant="gridItem" />
        </Grid>
      </Grid>
    </EntityLayout.Route>

    <EntityLayout.Route path="/docs" title="Docs">
      {techdocsContent}
    </EntityLayout.Route>
  </EntityLayout>
);
```

### 搜索页面实现

搜索页面支持多种搜索类型和过滤器：

```42:121:packages/app/src/components/search/SearchPage.tsx
const SearchPage = () => {
  const classes = useStyles();
  const { types } = useSearch();
  const catalogApi = useApi(catalogApiRef);

  return (
    <Page themeId="home">
      <Header title="Search" />
      <Content>
        <Grid container direction="row">
          <Grid item xs={12}>
            <Paper className={classes.bar}>
              <SearchBar />
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <SearchType.Accordion
              name="Result Type"
              defaultValue="software-catalog"
              types={[
                {
                  value: 'software-catalog',
                  name: 'Software Catalog',
                  icon: <CatalogIcon />,
                },
                {
                  value: 'techdocs',
                  name: 'Documentation',
                  icon: <DocsIcon />,
                },
              ]}
            />
            <Paper className={classes.filters}>
              {types.includes('techdocs') && (
                <SearchFilter.Select
                  className={classes.filter}
                  label="Entity"
                  name="name"
                  values={async () => {
                    // Return a list of entities which are documented.
                    const { items } = await catalogApi.getEntities({
                      fields: ['metadata.name'],
                      filter: {
                        'metadata.annotations.backstage.io/techdocs-ref':
                          CATALOG_FILTER_EXISTS,
                      },
                    });

                    const names = items.map(entity => entity.metadata.name);
                    names.sort();
                    return names;
                  }}
                />
              )}
              <SearchFilter.Select
                className={classes.filter}
                label="Kind"
                name="kind"
                values={['Component', 'Template']}
              />
              <SearchFilter.Checkbox
                className={classes.filter}
                label="Lifecycle"
                name="lifecycle"
                values={['experimental', 'production']}
              />
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <SearchPagination />
            <SearchResult>
              <CatalogSearchResultListItem icon={<CatalogIcon />} />
              <TechDocsSearchResultListItem icon={<DocsIcon />} />
            </SearchResult>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
```

## API 系统

### 前端 API 配置

前端通过 `apis.ts` 配置 API 工厂：

```12:19:packages/app/src/apis.ts
export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
];
```

### 后端 API 端点

后端通过新后端系统注册插件，每个插件可以注册自己的路由：

```9:66:packages/backend/src/index.ts
import { createBackend } from '@backstage/backend-defaults';

const backend = createBackend();

backend.add(import('@backstage/plugin-app-backend'));
backend.add(import('@backstage/plugin-proxy-backend'));

// scaffolder plugin
backend.add(import('@backstage/plugin-scaffolder-backend'));
backend.add(import('@backstage/plugin-scaffolder-backend-module-github'));
backend.add(
  import('@backstage/plugin-scaffolder-backend-module-notifications'),
);

// techdocs plugin
backend.add(import('@backstage/plugin-techdocs-backend'));

// auth plugin
backend.add(import('@backstage/plugin-auth-backend'));
// See https://backstage.io/docs/backend-system/building-backends/migrating#the-auth-plugin
backend.add(import('@backstage/plugin-auth-backend-module-guest-provider'));
// See https://backstage.io/docs/auth/guest/provider

// catalog plugin
backend.add(import('@backstage/plugin-catalog-backend'));
backend.add(
  import('@backstage/plugin-catalog-backend-module-scaffolder-entity-model'),
);

// See https://backstage.io/docs/features/software-catalog/configuration#subscribing-to-catalog-errors
backend.add(import('@backstage/plugin-catalog-backend-module-logs'));

// permission plugin
backend.add(import('@backstage/plugin-permission-backend'));
// See https://backstage.io/docs/permissions/getting-started for how to create your own permission policy
backend.add(
  import('@backstage/plugin-permission-backend-module-allow-all-policy'),
);

// search plugin
backend.add(import('@backstage/plugin-search-backend'));

// search engine
// See https://backstage.io/docs/features/search/search-engines
backend.add(import('@backstage/plugin-search-backend-module-pg'));

// search collators
backend.add(import('@backstage/plugin-search-backend-module-catalog'));
backend.add(import('@backstage/plugin-search-backend-module-techdocs'));

// kubernetes plugin
backend.add(import('@backstage/plugin-kubernetes-backend'));

// notifications and signals plugins
backend.add(import('@backstage/plugin-notifications-backend'));
backend.add(import('@backstage/plugin-signals-backend'));

backend.start();
```

### 自定义后端 API 端点示例

创建自定义后端插件并添加 API 端点：

```typescript
// plugins/my-plugin-backend/src/plugin.ts
import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';

export const myPlugin = createBackendPlugin({
  pluginId: 'my-plugin',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
      },
      async init({ httpRouter, logger }) {
        const router = express.Router();
        
        // GET /api/my-plugin/health
        router.get('/health', (_, res) => {
          logger.info('Health check called');
          res.json({ status: 'ok' });
        });
        
        // GET /api/my-plugin/data
        router.get('/data', async (_, res) => {
          const data = await fetchData();
          res.json(data);
        });
        
        httpRouter.use(router);
      },
    });
  },
});
```

## 配置与实体模型

## 端到端示例：自定义前后端插件

### 目标

- 实现一个“示例统计”插件：后端提供 `/api/my-stats/stats`，前端页面 `/stats` 展示数据。

### 后端实现（插件/模块）

```ts
import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import express from 'express';

export const myStatsBackend = createBackendPlugin({
  pluginId: 'my-stats',
  register(env) {
    env.registerInit({
      deps: { httpRouter: coreServices.httpRouter, logger: coreServices.logger },
      async init({ httpRouter, logger }) {
        const router = express.Router();
        router.get('/stats', (_req, res) => {
          logger.info('stats requested');
          res.json({ services: 12, apis: 5, docs: 23 });
        });
        httpRouter.use('/api/my-stats', router);
        httpRouter.addAuthPolicy({ path: '/api/my-stats/stats', allow: 'unauthenticated' });
      },
    });
  },
});
```

在 `packages/backend/src/index.ts` 安装：

```ts
backend.add(import('@org/plugin-my-stats-backend'));
```

### 前端实现（新前端系统）

```ts
import { ApiBlueprint, PageBlueprint, createFrontendModule, createApiRef } from '@backstage/frontend-plugin-api';

export interface StatsApi { getStats(): Promise<{ services: number; apis: number; docs: number }>; }
export const statsApiRef = createApiRef<StatsApi>({ id: 'plugin.stats' });

class DefaultStatsApi implements StatsApi {
  async getStats() {
    const res = await fetch('/api/my-stats/stats');
    return res.json();
  }
}

const StatsApiExt = ApiBlueprint.make({ params: p => p({ factory: () => new DefaultStatsApi(), apiRef: statsApiRef }) });

const StatsPage = PageBlueprint.make({
  params: {
    path: '/stats',
    loader: () => import('./components/StatsPage').then(m => <m.StatsPage />),
  },
});

export default createFrontendModule({ pluginId: 'my-stats', extensions: [StatsApiExt, StatsPage] });
```

示例页面消费 API：

```tsx
import { useApi } from '@backstage/core-plugin-api';
import { statsApiRef } from '../api';

export const StatsPage = () => {
  const api = useApi(statsApiRef);
  const [data, setData] = useState<{ services: number; apis: number; docs: number } | null>(null);
  useEffect(() => { api.getStats().then(setData); }, [api]);
  if (!data) return <Progress />;
  return <Typography>Services: {data.services}, APIs: {data.apis}, Docs: {data.docs}</Typography>;
};
```

### 本地试运行

```bash
yarn workspace backend start
yarn workspace app start
curl -s http://localhost:7007/api/my-stats/stats | jq .
```

预期：页面 `/stats` 展示后端返回的统计数据，接口返回 JSON。

### 应用配置

配置文件位于 `app-config.yaml`，主要配置项包括：

```1:114:app-config.yaml
app:
  title: Scaffolded Backstage App
  baseUrl: http://localhost:3000

organization:
  name: My Company

backend:
  # Used for enabling authentication, secret is shared by all backend plugins
  # See https://backstage.io/docs/auth/service-to-service-auth for
  # information on the format
  # auth:
  #   keys:
  #     - secret: ${BACKEND_SECRET}
  baseUrl: http://localhost:7007
  listen:
    port: 7007
    # Uncomment the following host directive to bind to specific interfaces
    # host: 127.0.0.1
  csp:
    connect-src: ["'self'", 'http:', 'https:']
    # Content-Security-Policy directives follow the Helmet format: https://helmetjs.github.io/#reference
    # Default Helmet Content-Security-Policy values can be removed by setting the key to false
  cors:
    origin: http://localhost:3000
    methods: [GET, HEAD, PATCH, POST, PUT, DELETE]
    credentials: true
  # This is for local development only, it is not recommended to use this in production
  # The production database configuration is stored in app-config.production.yaml
  database:
    client: better-sqlite3
    connection: ':memory:'
  # workingDirectory: /tmp # Use this to configure a working directory for the scaffolder, defaults to the OS temp-dir

integrations:
  github:
    - host: github.com
      # This is a Personal Access Token or PAT from GitHub. You can find out how to generate this token, and more information
      # about setting up the GitHub integration here: https://backstage.io/docs/integrations/github/locations#configuration
      token: ${GITHUB_TOKEN}
    ### Example for how to add your GitHub Enterprise instance using the API:
    # - host: ghe.example.net
    #   apiBaseUrl: https://ghe.example.net/api/v3
    #   token: ${GHE_TOKEN}

proxy:
  ### Example for how to add a proxy endpoint for the frontend.
  ### A typical reason to do this is to handle HTTPS and CORS for internal services.
  # endpoints:
  #   '/test':
  #     target: 'https://example.com'
  #     changeOrigin: true

# Reference documentation http://backstage.io/docs/features/techdocs/configuration
# Note: After experimenting with basic setup, use CI/CD to generate docs
# and an external cloud storage when deploying TechDocs for production use-case.
# https://backstage.io/docs/features/techdocs/how-to-guides#how-to-migrate-from-techdocs-basic-to-recommended-deployment-approach
techdocs:
  builder: 'local' # Alternatives - 'external'
  generator:
    runIn: 'docker' # Alternatives - 'local'
  publisher:
    type: 'local' # Alternatives - 'googleGcs' or 'awsS3'. Read documentation for using alternatives.

auth:
  # see https://backstage.io/docs/auth/ to learn about auth providers
  providers:
    # See https://backstage.io/docs/auth/guest/provider
    guest: {}

scaffolder:
  # see https://backstage.io/docs/features/software-templates/configuration for software template options

catalog:
  import:
    entityFilename: catalog-info.yaml
    pullRequestBranchName: backstage-integration
  rules:
    - allow: [Component, System, API, Resource, Location]
  locations:
    # Local example data, file locations are relative to the backend process, typically `packages/backend`
    - type: file
      target: ../../examples/entities.yaml

    # Local example template
    - type: file
      target: ../../examples/template/template.yaml
      rules:
        - allow: [Template]

    # Local example organizational data
    - type: file
      target: ../../examples/org.yaml
      rules:
        - allow: [User, Group]

    ## Uncomment these lines to add more example data
    # - type: url
    #   target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/all.yaml

    ## Uncomment these lines to add an example org
    # - type: url
    #   target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/acme-corp.yaml
    #   rules:
    #     - allow: [User, Group]

kubernetes:
  # see https://backstage.io/docs/features/kubernetes/configuration for kubernetes configuration options

# see https://backstage.io/docs/permissions/getting-started for more on the permission framework
permission:
  # setting this to `false` will disable permissions
  enabled: true
```

### Catalog 实体模型

实体示例文件位于 `examples/entities.yaml`：

```1:42:examples/entities.yaml
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-system
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: examples
spec:
  owner: guests
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-component
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: example-website
spec:
  type: website
  lifecycle: experimental
  owner: guests
  system: examples
  providesApis: [example-grpc-api]
---
# https://backstage.io/docs/features/software-catalog/descriptor-format#kind-api
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: example-grpc-api
spec:
  type: grpc
  lifecycle: experimental
  owner: guests
  system: examples
  definition: |
    syntax = "proto3";

    service Exampler {
      rpc Example (ExampleMessage) returns (ExampleMessage) {};
    }

    message ExampleMessage {
      string example = 1;
    };
```

### 实体类型说明

- **Component** - 软件组件（服务、网站、库等）
- **API** - API 定义
- **System** - 系统，包含多个组件
- **Domain** - 领域，包含多个系统
- **Resource** - 资源（数据库、消息队列等）
- **User** - 用户
- **Group** - 用户组
- **Location** - 位置（实体源）
- **Template** - 软件模板

## 常用内置插件与扩展点

- Catalog 实体提供者与处理器，前端实体页面与卡片
- Scaffolder 自定义后端动作与前端字段扩展
- TechDocs 文档生成与浏览
- Search 索引与结果页面扩展
- Auth 多提供商鉴权与会话服务

## 构建与调试

- 前端构建 yarn build
- 后端构建 yarn build
- 端到端测试 Playwright，单元测试 Jest
- 插件独立开发 yarn workspace pkg start

## 发布与版本管理

- 插件以 npm 包发布并在应用中引入
- 前端从经典模式迁移到新前端系统的扩展与模块
- 后端迁移到 createBackend 安装模型与依赖注入

## 迁移要点

- 前端扩展输入输出以数据引用数组声明并通过 get 访问
- createApp 移至 @backstage/frontend-defaults
- 旧版扩展需升级到 @backstage/frontend-plugin-api 0.7.0 及以上

## 实践建议

- 优先使用新前后端系统构建与迁移
- 前端后端与库分层，复用公共类型与逻辑
- 明确插件与扩展命名，避免冲突
- 后端路由默认鉴权，健康检查可匿名

## 侧边栏导航配置

侧边栏导航在 `packages/app/src/components/Root/Root.tsx` 中配置：

```60:99:packages/app/src/components/Root/Root.tsx
export const Root = ({ children }: PropsWithChildren<{}>) => (
  <SidebarPage>
    <Sidebar>
      <SidebarLogo />
      <SidebarGroup label="Search" icon={<SearchIcon />} to="/search">
        <SidebarSearchModal />
      </SidebarGroup>
      <SidebarDivider />
      <SidebarGroup label="Menu" icon={<MenuIcon />}>
        {/* Global nav, not org-specific */}
        <SidebarItem icon={HomeIcon} to="catalog" text="Home" />
        <MyGroupsSidebarItem
          singularTitle="My Group"
          pluralTitle="My Groups"
          icon={GroupIcon}
        />
        <SidebarItem icon={ExtensionIcon} to="api-docs" text="APIs" />
        <SidebarItem icon={LibraryBooks} to="docs" text="Docs" />
        <SidebarItem icon={CreateComponentIcon} to="create" text="Create..." />
        {/* End global nav */}
        <SidebarDivider />
        <SidebarScrollWrapper>
          {/* Items in this group will be scrollable if they run out of space */}
        </SidebarScrollWrapper>
      </SidebarGroup>
      <SidebarSpace />
      <SidebarDivider />
      <NotificationsSidebarItem />
      <SidebarDivider />
      <SidebarGroup
        label="Settings"
        icon={<UserSettingsSignInAvatar />}
        to="/settings"
      >
        <SidebarSettings />
      </SidebarGroup>
    </Sidebar>
    {children}
  </SidebarPage>
);
```

## 常用扩展点与实践

### 实体卡片扩展

可以在实体页面中添加自定义卡片：

```typescript
import { EntityLayout } from '@backstage/plugin-catalog';
import { MyCustomCard } from './components/MyCustomCard';

const customEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item md={6}>
          <EntityAboutCard />
        </Grid>
        <Grid item md={6}>
          <MyCustomCard /> {/* 自定义卡片 */}
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);
```

### 条件渲染实体内容

使用 `EntitySwitch` 根据实体属性条件渲染：

```typescript
import { EntitySwitch } from '@backstage/plugin-catalog';
import { isComponentType } from '@backstage/plugin-catalog';

<EntitySwitch>
  <EntitySwitch.Case if={isComponentType('service')}>
    <ServiceSpecificContent />
  </EntitySwitch.Case>
  <EntitySwitch.Case if={isComponentType('website')}>
    <WebsiteSpecificContent />
  </EntitySwitch.Case>
</EntitySwitch>
```

### 搜索扩展

添加自定义搜索结果类型：

```typescript
import { SearchResult } from '@backstage/plugin-search-react';
import { MySearchResultListItem } from './components/MySearchResultListItem';

<SearchResult>
  <CatalogSearchResultListItem />
  <TechDocsSearchResultListItem />
  <MySearchResultListItem /> {/* 自定义搜索结果 */}
</SearchResult>
```

## 调试与测试

### 前端调试

```bash
# 启动开发服务器（支持热重载）
yarn workspace app start

# 运行前端测试
yarn workspace app test

# 运行 E2E 测试
yarn test:e2e
```

### 后端调试

```bash
# 启动后端服务器
yarn workspace backend start

# 运行后端测试
yarn workspace backend test
```

### 查看日志

后端日志会输出到控制台，前端错误会显示在浏览器控制台。

## 部署

### 构建生产版本

```bash
# 构建所有包
yarn build:all

# 构建 Docker 镜像
yarn workspace backend build-image
```

### 环境配置

- `app-config.yaml` - 基础配置
- `app-config.local.yaml` - 本地开发配置（不提交到版本控制）
- `app-config.production.yaml` - 生产环境配置

#### 运行与验证（本地）

```bash
# 启动后端
yarn workspace backend start

# 启动前端
yarn workspace app start

# （可选）验证示例统计接口
curl -s http://localhost:7007/api/my-stats/stats | jq .
```

预期：返回 JSON 数据用于页面展示或 API 消费。

## 示例统计插件集成

### 集成概览

- 后端插件：见 [plugins/my-stats-backend/src/plugin.ts](plugins/my-stats-backend/src/plugin.ts)
  - 路由：`GET /api/my-stats/stats`（匿名可访问）
  - 装配：在 [packages/backend/src/index.ts](packages/backend/src/index.ts) 安装 `@org/plugin-my-stats-backend`
- 前端页面与 API：
  - 页面：`/stats` → [packages/app/src/components/stats/StatsPage.tsx](packages/app/src/components/stats/StatsPage.tsx)
  - 导航：侧边栏入口见 [packages/app/src/components/Root/Root.tsx](packages/app/src/components/Root/Root.tsx)
  - API 工厂与标识：见 [packages/app/src/apis.ts](packages/app/src/apis.ts) 的 `statsApiRef` 与默认实现

### 运行与验证（端到端）

```bash
yarn workspace backend start
yarn workspace app start
curl -s http://localhost:7007/api/my-stats/stats | jq .
# 浏览器访问：http://localhost:3000/stats
```

预期：接口返回 `{"services":12,"apis":5,"docs":23}`；页面展示三张统计卡片。

### 模块化与增强建议

- 新前端系统模块：使用 `PageBlueprint` + `ApiBlueprint` 封装 `StatsApi` 与 `StatsPage`，以独立包安装到应用；
- 可替换实现：为 `statsApiRef` 提供 mock 与真实实现，便于测试与环境切换；
- 真实数据：从 Catalog/TechDocs 计算统计或缓存到数据库；
- 权限策略：基于用户/组限制统计范围；
- 测试质量：增加后端路由的 Jest 测试与结构化日志字段（pluginId/path/duration）。

## 常见问题

### 1. 插件未加载

检查：

- 插件是否在 `packages/app/src/App.tsx` 中导入
- 后端插件是否在 `packages/backend/src/index.ts` 中注册
- 依赖是否正确安装

### 2. 实体未显示

检查：

- 实体文件是否在 `catalog.locations` 中配置
- 实体格式是否正确
- 后端日志是否有错误信息

### 3. 搜索无结果

检查：

- 搜索后端插件是否已安装
- 搜索引擎是否配置正确
- 搜索收集器是否已注册

## 参考资料

### 官方文档

- [Backstage 官方文档](https://backstage.io/docs)
- [插件开发指南](https://backstage.io/docs/plugins/building-plugins/index/)
- [后端插件开发](https://backstage.io/docs/plugins/backend-plugin/)
- [新后端系统](https://backstage.io/docs/plugins/new-backend-system/)
- [插件组合性](https://backstage.io/docs/plugins/composability/)
- [API 参考](https://backstage.io/docs/reference/core-plugin-api.createrouteref/)

### 项目相关

- [GitHub 仓库](https://github.com/backstage/backstage)
- [插件市场](https://backstage.io/plugins)
- [社区 Discord](https://discord.gg/backstage)
