'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCategories, getItems, stockState, type Category, type Item } from './api'
import { useLocalStorageValue } from './useLocalStorageValue'

type InventoryContext = {
  items: Item[]
  categories: Category[]
  loading: boolean
  error: string | null
  username: string
  lowCount: number
  refresh: () => Promise<void>
  /** Merge a server-returned item back into the list without a full refetch. */
  applyItem: (item: Item) => void
  dropItem: (id: string) => void
}

const Ctx = createContext<InventoryContext | null>(null)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const token = useLocalStorageValue('accessToken')
  const username = useMemo(() => {
    if (!token) return ''
    try {
      return JSON.parse(atob(token.split('.')[1])).username as string
    } catch {
      return ''
    }
  }, [token])

  type Loaded = { items: Item[]; categories: Category[]; error: string | null }

  const fetchAll = useCallback(async (): Promise<Loaded> => {
    try {
      const [nextItems, nextCategories] = await Promise.all([getItems(), getCategories()])
      return { items: nextItems, categories: nextCategories, error: null }
    } catch (err) {
      return {
        items: [],
        categories: [],
        error: err instanceof Error ? err.message : 'Could not reach the server.',
      }
    }
  }, [])

  const commit = useCallback((loaded: Loaded) => {
    if (loaded.error) {
      setError(loaded.error)
    } else {
      setItems(loaded.items)
      setCategories(loaded.categories)
      setError(null)
    }
    setLoading(false)
  }, [])

  const refresh = useCallback(async () => commit(await fetchAll()), [commit, fetchAll])

  useEffect(() => {
    // Read straight from storage rather than the subscribed value: on the very
    // first (hydrating) render that value is still the server's null, which
    // would bounce a signed-in user to /login.
    if (!localStorage.getItem('accessToken')) {
      router.replace('/login')
      return
    }
    let alive = true
    fetchAll().then((loaded) => {
      if (alive) commit(loaded)
    })
    return () => {
      alive = false
    }
  }, [fetchAll, commit, router])

  const applyItem = useCallback((item: Item) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      const next = exists ? prev.map((i) => (i.id === item.id ? item : i)) : [...prev, item]
      return next.sort((a, b) => a.name.localeCompare(b.name))
    })
  }, [])

  const dropItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const value = useMemo<InventoryContext>(
    () => ({
      items,
      categories,
      loading,
      error,
      username,
      lowCount: items.filter((i) => stockState(i) !== 'ok').length,
      refresh,
      applyItem,
      dropItem,
    }),
    [items, categories, loading, error, username, refresh, applyItem, dropItem]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useInventory() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider')
  return ctx
}
