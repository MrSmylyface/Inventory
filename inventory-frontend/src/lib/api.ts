import { authFetch } from './authFetch'

export const API = 'http://localhost:3001/api'

export type Category = { id: string; name: string }

export type Item = {
  id: string
  sku: string
  name: string
  quantity: number
  price: number
  reorderPoint: number
  supplier: string
  bin: string
  categoryId: Category | null
  createdAt: string
  updatedAt: string
}

export type StockState = 'out' | 'low' | 'ok'

export function stockState(item: Pick<Item, 'quantity' | 'reorderPoint'>): StockState {
  if (item.quantity <= 0) return 'out'
  if (item.quantity <= item.reorderPoint) return 'low'
  return 'ok'
}

export const STOCK_LABEL: Record<StockState, string> = {
  ok: 'In stock',
  low: 'Low',
  out: 'Out of stock',
}

/** Units needed to bring an item back up to its reorder point, plus a buffer. */
export function suggestedOrderQty(item: Pick<Item, 'quantity' | 'reorderPoint'>) {
  const target = Math.ceil(item.reorderPoint * 1.5)
  return Math.max(target - item.quantity, 1)
}

export function formatMoney(value: number) {
  return value.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatQty(value: number) {
  return value.toLocaleString('en-GB')
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function unwrap<T>(res: Response): Promise<T> {
  const body = await res.json()
  if (!res.ok || body.success === false) {
    throw new Error(body.error || body.message || 'Request failed')
  }
  return body.data as T
}

export async function getItems() {
  return unwrap<Item[]>(await authFetch(`${API}/inventory`))
}

export async function getItem(id: string) {
  return unwrap<Item>(await authFetch(`${API}/inventory/${id}`))
}

/** What the API accepts on write: `categoryId` is an id here, not the populated object. */
export type ItemInput = {
  sku: string
  name: string
  quantity: number
  price: number
  reorderPoint?: number
  supplier?: string
  bin?: string
  categoryId?: string | null
}

export async function createItem(payload: ItemInput) {
  return unwrap<Item>(
    await authFetch(`${API}/inventory`, { method: 'POST', body: JSON.stringify(payload) })
  )
}

export async function updateItem(id: string, payload: Record<string, unknown>) {
  return unwrap<Item>(
    await authFetch(`${API}/inventory/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
  )
}

export async function receiveStock(id: string, quantity: number, bin?: string) {
  return unwrap<Item>(
    await authFetch(`${API}/inventory/${id}/receive`, {
      method: 'POST',
      body: JSON.stringify({ quantity, ...(bin ? { bin } : {}) }),
    })
  )
}

export async function deleteItem(id: string) {
  return unwrap<null>(await authFetch(`${API}/inventory/${id}`, { method: 'DELETE' }))
}

export async function getCategories() {
  return unwrap<Category[]>(await authFetch(`${API}/categories`))
}
