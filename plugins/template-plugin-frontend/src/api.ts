import { createApiRef } from '@backstage/frontend-plugin-api';
import {
  AnyApiFactory,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
  fetchApiRef,
  createApiRef as coreCreateApiRef,
} from '@backstage/core-plugin-api';
import { TemplateClient, TemplateItem, CreateItemInput, UpdateItemInput } from '@org/plugin-template-client';

/**
 * Template API 接口定义
 */
export interface TemplateApi {
  listItems(): Promise<TemplateItem[]>;
  getItem(id: number): Promise<TemplateItem>;
  createItem(input: CreateItemInput): Promise<TemplateItem>;
  updateItem(id: number, changes: UpdateItemInput): Promise<TemplateItem>;
  deleteItem(id: number): Promise<void>;
}

/**
 * 新前端系统 API 引用
 */
export const templateApiRef = createApiRef<TemplateApi>({ 
  id: 'plugin.template.api' 
});

/**
 * 经典模式 API 引用（用于兼容）
 */
export const templateApiRefCore = coreCreateApiRef<TemplateApi>({ 
  id: 'plugin.template.api' 
});

/**
 * API 工厂
 * 
 * 用于在应用中注册 API 实现
 */
export const templateApiFactory: AnyApiFactory = createApiFactory({
  api: templateApiRefCore,
  deps: { 
    discoveryApi: discoveryApiRef, 
    identityApi: identityApiRef, 
    fetchApi: fetchApiRef 
  },
  factory: ({ discoveryApi, identityApi, fetchApi }) =>
    new TemplateClient({ discoveryApi, identityApi, fetchApi }),
});

