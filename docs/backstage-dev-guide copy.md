# Backstage 开发文档

## 目标与范围

- 概览架构与仓库结构，明确前后端插件的开发模型
- 详述插件、页面、API 的开发流程与代码骨架（新前后端系统与经典模式）
- 涵盖配置、实体模型、常用扩展点、构建与发布实践

## 项目与仓库结构

- 应用与插件以 Yarn workspaces 管理，TypeScript 编写
- 常见目录
  - packages/app 前端应用入口
  - packages/backend 后端应用入口
  - plugins/* 前后端插件与模块包
  - app-config*.yaml 应用配置

## 开发环境

- 创建应用 npx @backstage/create-app
- 启动前端 yarn start
- 启动后端 yarn start-backend
- 新建前端插件 yarn new 选择 plugin
- 新建后端插件 yarn new 选择 backend-plugin

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

## 配置与实体模型

- 配置文件 app-config.yaml, app-config.local.yaml
- 前端通过 ConfigApi 读取配置，后端通过 config 服务读取
- Catalog 实体示例

```yaml
apiVersion: backstage.io/v1alpha1 # Catalog 实体版本
kind: Component # 实体类型为组件
metadata: # 元数据部分
  name: example-service # 组件名称，唯一标识
  description: Example Service # 组件描述信息
spec: # 组件规格定义
  type: service # 组件类型，例如 service、website、library
  lifecycle: production # 生命周期阶段，例如 experimental、production
  owner: team-example # 负责团队或实体的标识
```

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
- 插件独立开发 yarn workspace <pkg> start

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

## 参考资料

- https://backstage.io/docs/plugins/building-plugins/index/
- https://backstage.io/docs/plugins/backend-plugin/
- https://backstage.io/docs/plugins/new-backend-system/
- https://backstage.io/docs/plugins/composability/
- https://backstage.io/docs/reference/core-plugin-api.createrouteref/
