# Formily Plugin Frontend

这是一个标准的 Backstage 前端插件模板。

## 功能特性

- ✅ 新前端系统 API 集成
- ✅ 经典模式兼容
- ✅ React 组件示例
- ✅ CRUD 操作 UI
- ✅ 错误处理和加载状态
- ✅ Material-UI 组件

## 文件结构

```
formily-plugin/
├── src/
│   ├── api.ts                 # API 定义和工厂
│   ├── module.ts              # 模块导出
│   └── components/            # React 组件
│       ├── TemplatePage.tsx   # 主页面组件
│       └── index.ts           # 组件导出
├── package.json
└── README.md
```

## 使用方法

1. 在 `packages/app/src/apis.ts` 中添加 API 工厂：

```typescript
import { templateApiFactory } from '@backstage/plugin-formily';

export const apis: AnyApiFactory[] = [
  // ... 其他 API
  templateApiFactory,
];
```

2. 在 `packages/app/src/App.tsx` 中添加路由：

```typescript
import { TemplatePage } from '@backstage/plugin-formily';

// 在 FlatRoutes 中添加
<Route path="/template" element={<TemplatePage />} />
```

3. 根据需要修改组件和 API 接口

