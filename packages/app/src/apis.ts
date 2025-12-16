import {
  ScmIntegrationsApi,
  scmIntegrationsApiRef,
  ScmAuth,
} from '@backstage/integration-react';
import { AnyApiFactory, configApiRef, createApiFactory } from '@backstage/core-plugin-api';
import { statsApiFactory } from '@org/plugin-my-stats-frontend';
import { templateApiFactory } from '@org/plugin-template-frontend';
import { formilyApiFactory } from '@org/plugin-formily';

export const apis: AnyApiFactory[] = [
  createApiFactory({
    api: scmIntegrationsApiRef,
    deps: { configApi: configApiRef },
    factory: ({ configApi }) => ScmIntegrationsApi.fromConfig(configApi),
  }),
  ScmAuth.createDefaultApiFactory(),
  statsApiFactory,
  templateApiFactory,
  formilyApiFactory,
];

 
