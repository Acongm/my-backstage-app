import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './router';

/**
 * 模板后端插件
 * 
 * 这是一个标准的 Backstage 后端插件模板，包含：
 * - HTTP 路由注册
 * - 数据库集成
 * - 日志服务
 * - 认证策略配置
 * 
 * 使用方法：
 * 1. 在 packages/backend/src/index.ts 中添加：
 *    backend.add(import('@org/plugin-template-backend'));
 * 
 * 2. 根据需要修改 pluginId、路由和业务逻辑
 */
export const templatePluginBackend = createBackendPlugin({
  pluginId: 'template',
  register(env) {
    env.registerInit({
      deps: { 
        httpRouter: coreServices.httpRouter, 
        logger: coreServices.logger, 
        database: coreServices.database 
      },
      async init({ httpRouter, logger, database }) {
        const router = await createRouter({ logger, database });
        httpRouter.use(router);
        
        // 配置认证策略
        // 'unauthenticated' - 允许未认证访问
        // 'user' - 需要用户认证
        httpRouter.addAuthPolicy({ path: '/health', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/api', allow: 'user' });
        httpRouter.addAuthPolicy({ path: '/api/:id', allow: 'user' });
      },
    });
  },
});

export default templatePluginBackend;

