import { DiscoveryApi, IdentityApi, FetchApi } from '@backstage/core-plugin-api'

export type Stats = { services: number; apis: number; docs: number }

export type Item = {
  id: number
  name: string
  value: number
  description?: string | null
  created_at: string
  updated_at: string
}

export class MyStatsClient {
  private readonly discoveryApi: DiscoveryApi
  private readonly identityApi?: IdentityApi
  private readonly fetchApi: FetchApi

  constructor(options: { discoveryApi: DiscoveryApi; identityApi?: IdentityApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi
    this.identityApi = options.identityApi
    this.fetchApi = options.fetchApi
  }

  async getStats(): Promise<Stats> {
    const baseUrl = await this.discoveryApi.getBaseUrl('my-stats')
    const headers: Record<string, string> = {}
    if (this.identityApi) {
      const { token } = await this.identityApi.getCredentials()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    const res = await this.fetchApi.fetch(`${baseUrl}/stats`, { headers })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return (await res.json()) as Stats
  }

  private async headers(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}
    if (this.identityApi) {
      const { token } = await this.identityApi.getCredentials()
      if (token) headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  async listItems(): Promise<Item[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('my-stats')
    const res = await this.fetchApi.fetch(`${baseUrl}/items`, { headers: await this.headers() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json()
    return (body.items ?? []) as Item[]
  }

  async getItem(id: number): Promise<Item> {
    const baseUrl = await this.discoveryApi.getBaseUrl('my-stats')
    const res = await this.fetchApi.fetch(`${baseUrl}/items/${id}`, { headers: await this.headers() })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as Item
  }

  async createItem(input: { name: string; value: number; description?: string | null }): Promise<Item> {
    const baseUrl = await this.discoveryApi.getBaseUrl('my-stats')
    const res = await this.fetchApi.fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await this.headers()) },
      body: JSON.stringify(input),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as Item
  }

  async updateItem(
    id: number,
    changes: Partial<{ name: string; value: number; description?: string | null }>,
  ): Promise<Item> {
    const baseUrl = await this.discoveryApi.getBaseUrl('my-stats')
    const res = await this.fetchApi.fetch(`${baseUrl}/items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...(await this.headers()) },
      body: JSON.stringify(changes),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as Item
  }

  async deleteItem(id: number): Promise<void> {
    const baseUrl = await this.discoveryApi.getBaseUrl('my-stats')
    const res = await this.fetchApi.fetch(`${baseUrl}/items/${id}`, {
      method: 'DELETE',
      headers: await this.headers(),
    })
    if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`)
  }
}
