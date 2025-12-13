import { createBackendPlugin, coreServices } from '@backstage/backend-plugin-api';
import { createRouter } from './router';

export const myStatsBackend = createBackendPlugin({
  pluginId: 'my-stats',
  register(env) {
    env.registerInit({
      deps: { httpRouter: coreServices.httpRouter, logger: coreServices.logger, database: coreServices.database },
      async init({ httpRouter, logger, database }) {
        const router = await createRouter({ logger, database });
        httpRouter.use(router);
        httpRouter.addAuthPolicy({ path: '/stats', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/health', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/items', allow: 'unauthenticated' });
        httpRouter.addAuthPolicy({ path: '/items/:id', allow: 'unauthenticated' });
      },
    });
  },
});

export default myStatsBackend;
