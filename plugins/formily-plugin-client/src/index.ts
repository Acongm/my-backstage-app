import { DiscoveryApi, IdentityApi, FetchApi } from '@backstage/core-plugin-api';

/**
 * 数据类型定义
 */
export type FormilyItem = {
  id: number;
  name: string;
  type: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type CreateItemInput = {
  name: string;
  type: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
};

export type UpdateItemInput = Partial<CreateItemInput>;

/**
 * Formily Plugin 客户端
 * 
 * 负责与后端 API 通信，处理：
 * - 服务发现
 * - 身份认证
 * - HTTP 请求
 * - 错误处理
 */
export class FormilyClient {
  private readonly discoveryApi: DiscoveryApi;
  private readonly identityApi?: IdentityApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { 
    discoveryApi: DiscoveryApi; 
    identityApi?: IdentityApi; 
    fetchApi: FetchApi;
  }) {
    this.discoveryApi = options.discoveryApi;
    this.identityApi = options.identityApi;
    this.fetchApi = options.fetchApi;
  }

  /**
   * 获取认证头
   */
  private async headers(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (this.identityApi) {
      const { token } = await this.identityApi.getCredentials();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    return headers;
  }

  /**
   * 获取所有项目
   */
  async listItems(): Promise<FormilyItem[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('formily');
    const res = await this.fetchApi.fetch(`${baseUrl}/api`, {
      headers: await this.headers(),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to fetch items`);
    }
    const body = await res.json();
    return (body.items ?? []) as FormilyItem[];
  }

  /**
   * 根据 ID 获取单个项目
   */
  async getItem(id: number): Promise<FormilyItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('formily');
    const res = await this.fetchApi.fetch(`${baseUrl}/api/${id}`, {
      headers: await this.headers(),
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Item not found');
      }
      throw new Error(`HTTP ${res.status}: Failed to fetch item`);
    }
    return (await res.json()) as FormilyItem;
  }

  /**
   * 创建新项目
   */
  async createItem(input: CreateItemInput): Promise<FormilyItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('formily');
    const res = await this.fetchApi.fetch(`${baseUrl}/api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.headers()),
      },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to create item`);
    }
    return (await res.json()) as FormilyItem;
  }

  /**
   * 更新项目
   */
  async updateItem(id: number, changes: UpdateItemInput): Promise<FormilyItem> {
    const baseUrl = await this.discoveryApi.getBaseUrl('formily');
    const res = await this.fetchApi.fetch(`${baseUrl}/api/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(await this.headers()),
      },
      body: JSON.stringify(changes),
    });
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Item not found');
      }
      throw new Error(`HTTP ${res.status}: Failed to update item`);
    }
    return (await res.json()) as FormilyItem;
  }

  /**
   * 删除项目
   */
  async deleteItem(id: number): Promise<void> {
    const baseUrl = await this.discoveryApi.getBaseUrl('formily');
    const res = await this.fetchApi.fetch(`${baseUrl}/api/${id}`, {
      method: 'DELETE',
      headers: await this.headers(),
    });
    if (!res.ok && res.status !== 204) {
      if (res.status === 404) {
        throw new Error('Item not found');
      }
      throw new Error(`HTTP ${res.status}: Failed to delete item`);
    }
  }
}
