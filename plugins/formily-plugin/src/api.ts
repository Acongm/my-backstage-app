import {
  AnyApiFactory,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
  fetchApiRef,
  createApiRef,
} from '@backstage/core-plugin-api';
import { FormilyClient, FormilyItem, CreateItemInput, UpdateItemInput } from '@org/plugin-formily-client';

/**
 * formily API 接口定义
 */
export interface FormilyApi {
  listItems(): Promise<FormilyItem[]>;
  getItem(id: number): Promise<FormilyItem>;
  createItem(input: CreateItemInput): Promise<FormilyItem>;
  updateItem(id: number, changes: UpdateItemInput): Promise<FormilyItem>;
  deleteItem(id: number): Promise<void>;
}

export const formilyApiRef = createApiRef<FormilyApi>({ id: 'plugin.formily.api' });

/**
 * API 工厂
 * 
 * 用于在应用中注册 API 实现
 */
export const formilyApiFactory: AnyApiFactory = createApiFactory({
  api: formilyApiRef,
  deps: { 
    discoveryApi: discoveryApiRef, 
    identityApi: identityApiRef, 
    fetchApi: fetchApiRef 
  },
  factory: ({ discoveryApi, identityApi, fetchApi }) =>
    new FormilyClient({ discoveryApi, identityApi, fetchApi }),
});
