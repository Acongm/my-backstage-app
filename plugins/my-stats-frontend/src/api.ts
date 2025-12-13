import { createApiRef } from '@backstage/frontend-plugin-api'
import {
  AnyApiFactory,
  createApiFactory,
  discoveryApiRef,
  identityApiRef,
  fetchApiRef,
  createApiRef as coreCreateApiRef,
} from '@backstage/core-plugin-api'
import { MyStatsClient } from '@org/plugin-my-stats-client'

export interface StatsApi {
  getStats(): Promise<{ services: number; apis: number; docs: number }>
  listItems(): Promise<{
    id: number
    name: string
    value: number
    description?: string | null
    created_at: string
    updated_at: string
  }[]>
  getItem(id: number): Promise<{
    id: number
    name: string
    value: number
    description?: string | null
    created_at: string
    updated_at: string
  }>
  createItem(input: { name: string; value: number; description?: string | null }): Promise<{
    id: number
    name: string
    value: number
    description?: string | null
    created_at: string
    updated_at: string
  }>
  updateItem(
    id: number,
    changes: Partial<{ name: string; value: number; description?: string | null }>,
  ): Promise<{
    id: number
    name: string
    value: number
    description?: string | null
    created_at: string
    updated_at: string
  }>
  deleteItem(id: number): Promise<void>
}

export const statsApiRef = createApiRef<StatsApi>({ id: 'plugin.my-stats.api' })

export const statsApiRefCore = coreCreateApiRef<StatsApi>({ id: 'plugin.my-stats.api' })

export const statsApiFactory: AnyApiFactory = createApiFactory({
  api: statsApiRefCore,
  deps: { discoveryApi: discoveryApiRef, identityApi: identityApiRef, fetchApi: fetchApiRef },
  factory: ({ discoveryApi, identityApi, fetchApi }) =>
    new MyStatsClient({ discoveryApi, identityApi, fetchApi }),
})
