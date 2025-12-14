# Template Plugin - 标准插件模板

这是一个完整的 Backstage 插件模板，基于 Catalog 插件的最佳实践设计，可以作为快速开发新插件的起点。

## 📁 插件结构

```
plugins/
├── template-plugin-backend/      # 后端插件
│   ├── src/
│   │   ├── index.ts              # 导出入口
│   │   ├── plugin.ts             # 插件定义和注册
│   │   ├── router.ts             # HTTP 路由处理器
│   │   ├── repositories/         # 数据访问层
│   │   │   └── items.ts
│   │   └── validation/           # 数据验证层
│   │       └── items.ts
│   ├── package.json
│   └── README.md
│
├── template-plugin-client/       # 前端客户端（API 通信层）
│   ├── src/
│   │   └── index.ts              # 客户端实现
│   └── package.json
│
└── template-plugin-frontend/    # 前端模块（UI 组件）
    ├── src/
    │   ├── api.ts                # API 定义和工厂
    │   ├── module.ts             # 模块导出
    │   └── components/           # React 组件
    │       ├── TemplatePage.tsx  # 主页面组件
    │       └── index.ts
    ├── package.json
    └── README.md
```

## 🏗️ 架构设计

### 三层架构

1. **后端插件 (Backend)**
   - 提供 HTTP API 端点
   - 数据库操作（Knex）
   - 业务逻辑处理
   - 认证和授权

2. **前端客户端 (Client)**
   - 封装 API 调用
   - 处理服务发现
   - 身份认证
   - 错误处理

3. **前端模块 (Frontend)**
   - React UI 组件
   - API 引用和工厂
   - 页面路由

### 设计原则

- **关注点分离**：后端、客户端、前端各司其职
- **类型安全**：TypeScript 类型定义贯穿全栈
- **可测试性**：清晰的依赖注入和接口定义
- **可扩展性**：模块化设计，易于扩展

## 🚀 快速开始

### 1. 复制模板

将 `template-plugin-*` 目录复制并重命名为你的插件名称：

```bash
# 假设你要创建一个名为 "my-feature" 的插件
cp -r plugins/template-plugin-backend plugins/my-feature-backend
cp -r plugins/template-plugin-client plugins/my-feature-client
cp -r plugins/template-plugin-frontend plugins/my-feature-frontend
```

### 2. 重命名和替换

在所有文件中替换以下内容：

- `template` → `my-feature` (插件 ID)
- `Template` → `MyFeature` (类名和组件名)
- `template-plugin` → `my-feature-plugin` (包名)
- `@org/plugin-template-*` → `@org/plugin-my-feature-*` (包名)

### 3. 修改后端插件

#### 3.1 更新 package.json

```json
{
  "name": "@org/plugin-my-feature-backend",
  // ...
}
```

#### 3.2 修改 plugin.ts

```typescript
export const myFeatureBackend = createBackendPlugin({
  pluginId: 'my-feature',  // 修改插件 ID
  // ...
});
```

#### 3.3 调整路由和业务逻辑

- 修改 `router.ts` 中的路由路径
- 更新数据库表结构（如需要）
- 实现你的业务逻辑

### 4. 修改前端客户端

#### 4.1 更新 package.json

```json
{
  "name": "@org/plugin-my-feature-client",
  // ...
}
```

#### 4.2 修改客户端类

```typescript
export class MyFeatureClient {
  // 更新方法名和业务逻辑
}
```

### 5. 修改前端模块

#### 5.1 更新 package.json

```json
{
  "name": "@org/plugin-my-feature-frontend",
  "dependencies": {
    "@org/plugin-my-feature-client": "^0.1.0",
    // ...
  }
}
```

#### 5.2 更新 API 定义

```typescript
export const myFeatureApiRef = createApiRef<MyFeatureApi>({ 
  id: 'plugin.my-feature.api' 
});
```

#### 5.3 自定义 UI 组件

根据需求修改 `TemplatePage.tsx` 或创建新的组件。

### 6. 注册插件

#### 6.1 后端注册

在 `packages/backend/src/index.ts` 中添加：

```typescript
backend.add(import('@org/plugin-my-feature-backend'));
```

#### 6.2 前端 API 注册

在 `packages/app/src/apis.ts` 中添加：

```typescript
import { myFeatureApiFactory } from '@org/plugin-my-feature-frontend';

export const apis: AnyApiFactory[] = [
  // ... 其他 API
  myFeatureApiFactory,
];
```

#### 6.3 前端路由注册

在 `packages/app/src/App.tsx` 中添加：

```typescript
import { MyFeaturePage } from '@org/plugin-my-feature-frontend';

// 在 FlatRoutes 中添加
<Route path="/my-feature" element={<MyFeaturePage />} />
```

## 📝 关键文件说明

### 后端

- **plugin.ts**: 插件定义，注册初始化逻辑
- **router.ts**: Express 路由，处理 HTTP 请求
- **repositories/**: 数据访问层，数据库操作
- **validation/**: 数据验证，输入校验

### 客户端

- **index.ts**: API 客户端实现，封装 HTTP 请求

### 前端

- **api.ts**: API 接口定义和工厂
- **module.ts**: 模块导出
- **components/**: React UI 组件

## 🔧 自定义开发

### 添加新的 API 端点

1. 在后端 `router.ts` 中添加路由
2. 在客户端 `index.ts` 中添加方法
3. 在前端 `api.ts` 中更新接口定义
4. 在 UI 组件中使用新方法

### 添加数据库表

在 `router.ts` 的 `createRouter` 函数中：

```typescript
const hasNewTable = await knex.schema.hasTable('my_new_table');
if (!hasNewTable) {
  await knex.schema.createTable('my_new_table', t => {
    t.increments('id').primary();
    // 添加字段
  });
}
```

### 添加认证策略

在 `plugin.ts` 中：

```typescript
httpRouter.addAuthPolicy({ 
  path: '/your-path', 
  allow: 'user'  // 或 'unauthenticated'
});
```

## 📚 参考资源

- [Backstage 开发文档](./docs/backstage-dev-guide.md)
- [Backstage 插件开发指南](https://backstage.io/docs/plugins/)
- [现有插件示例](./plugins/my-stats-backend/)

## ✅ 检查清单

使用模板创建新插件时，确保：

- [ ] 所有包名已更新
- [ ] 插件 ID 已更新
- [ ] 路由路径已更新
- [ ] 数据库表结构已调整（如需要）
- [ ] API 接口已定义
- [ ] UI 组件已实现
- [ ] 后端已注册
- [ ] 前端 API 已注册
- [ ] 前端路由已注册
- [ ] 测试通过

## 🎯 下一步

1. 根据业务需求修改业务逻辑
2. 添加单元测试和集成测试
3. 添加错误处理和日志
4. 优化 UI/UX
5. 添加文档和示例

---

**提示**: 这个模板遵循 Backstage 的最佳实践，可以直接使用或根据需求调整。如有问题，请参考现有插件实现或 Backstage 官方文档。

