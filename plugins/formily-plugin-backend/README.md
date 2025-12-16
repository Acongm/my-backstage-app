# Template Plugin Backend

这是一个标准的 Backstage 后端插件模板。

## 功能特性

- ✅ HTTP 路由注册
- ✅ 数据库集成（Knex）
- ✅ 日志服务
- ✅ 认证策略配置
- ✅ CRUD 操作示例
- ✅ 数据验证层
- ✅ 错误处理

## 文件结构

```
template-plugin-backend/
├── src/
│   ├── index.ts              # 导出入口
│   ├── plugin.ts             # 插件定义和注册
│   ├── router.ts             # 路由处理器
│   ├── repositories/         # 数据访问层
│   │   └── items.ts
│   └── validation/           # 数据验证层
│       └── items.ts
├── package.json
└── README.md
```

## 使用方法

1. 在 `packages/backend/src/index.ts` 中添加：

```typescript
backend.add(import('@org/plugin-template-backend'));
```

2. 修改插件 ID 和业务逻辑以满足你的需求

3. 根据需要调整数据库表结构和 API 端点

## API 端点

- `GET /api/template/health` - 健康检查
- `GET /api/template/api` - 获取所有项目
- `GET /api/template/api/:id` - 获取单个项目
- `POST /api/template/api` - 创建新项目
- `PUT /api/template/api/:id` - 更新项目
- `DELETE /api/template/api/:id` - 删除项目

