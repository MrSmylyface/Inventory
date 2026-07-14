'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell, TopBar } from '@/components/AppShell'
import { StatusBadge } from '@/components/StatusBadge'
import { QuickAddDrawer } from '@/components/QuickAddDrawer'
import { useInventory } from '@/lib/store'
import { deleteItem, formatQty, stockState, timeAgo, updateItem, type Item, type StockState } from '@/lib/api'

type SortKey = 'sku' | 'name' | 'quantity' | 'reorderPoint' | 'supplier' | 'bin' | 'updatedAt'
type Sort = { key: SortKey; dir: 'asc' | 'desc' }

const COLUMNS: { key: SortKey; label: string; className: string; numeric?: boolean }[] = [
  { key: 'sku', label: 'SKU', className: 'w-[104px]' },
  { key: 'name', label: 'Description', className: 'min-w-[260px]' },
  { key: 'bin', label: 'Bin', className: 'w-[84px]' },
  { key: 'supplier', label: 'Supplier', className: 'w-[160px]' },
  { key: 'quantity', label: 'On hand', className: 'w-[96px] whitespace-nowrap text-right', numeric: true },
  { key: 'reorderPoint', label: 'Reorder at', className: 'w-[112px] whitespace-nowrap text-right', numeric: true },
  { key: 'updatedAt', label: 'Updated', className: 'w-[104px]' },
]

export default function InventoryPage() {
  const { items, categories, loading, error, applyItem, dropItem, refresh } = useInventory()
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'' | StockState>('')
  const [sort, setSort] = useState<Sort>({ key: 'sku', dir: 'asc' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [editing, setEditing] = useState<string | null>(null)
  const [draftQty, setDraftQty] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Warehouse staff live on the keyboard: "/" jumps to search, "n" opens the
  // quick-add drawer, Escape backs out of whatever you are in.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      // A focused checkbox is not "typing" — shortcuts must keep working after
      // you tick a row, which is exactly when you reach for one.
      const isTextEntry =
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        (target.tagName === 'INPUT' &&
          !['checkbox', 'radio', 'button', 'submit', 'reset'].includes(
            (target as HTMLInputElement).type
          ))
      const typing = isTextEntry
      if (e.key === '/' && !typing) {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === 'n' && !typing && !drawerOpen) {
        e.preventDefault()
        setDrawerOpen(true)
      } else if (e.key === 'Escape' && !drawerOpen) {
        if (typing) searchRef.current?.blur()
        setSelected(new Set())
        setEditing(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = items.filter((item) => {
      if (category && item.categoryId?.id !== category) return false
      if (status && stockState(item) !== status) return false
      if (!q) return true
      return (
        item.sku.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q) ||
        item.bin.toLowerCase().includes(q)
      )
    })

    const dir = sort.dir === 'asc' ? 1 : -1
    return [...filtered].sort((a, b) => {
      const left = a[sort.key]
      const right = b[sort.key]
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * dir
      return String(left).localeCompare(String(right)) * dir
    })
  }, [items, query, category, status, sort])

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))

  const allVisibleSelected = visible.length > 0 && visible.every((i) => selected.has(i.id))

  const toggleAll = () => {
    setSelected(allVisibleSelected ? new Set() : new Set(visible.map((i) => i.id)))
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const beginEdit = (item: Item) => {
    setEditing(item.id)
    setDraftQty(String(item.quantity))
  }

  const commitEdit = async (item: Item) => {
    const quantity = Number(draftQty)
    setEditing(null)
    if (!Number.isFinite(quantity) || quantity < 0 || quantity === item.quantity) return
    // Show the new count immediately, then reconcile with whatever the server stored.
    applyItem({ ...item, quantity })
    try {
      applyItem(await updateItem(item.id, { quantity }))
    } catch {
      refresh()
    }
  }

  const deleteSelected = async () => {
    const ids = [...selected]
    if (!confirm(`Delete ${ids.length} item${ids.length === 1 ? '' : 's'}? This cannot be undone.`)) return
    setBusy(true)
    try {
      await Promise.all(ids.map((id) => deleteItem(id)))
      ids.forEach(dropItem)
      setSelected(new Set())
    } catch {
      refresh()
    } finally {
      setBusy(false)
    }
  }

  const filtersActive = Boolean(query || category || status)

  return (
    <AppShell
      header={
        <TopBar>
          <div className="flex h-14 items-center gap-2 px-4">
            <div className="relative flex-1 max-w-md">
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SKU, description, supplier or bin"
                className="w-full rounded-sm border border-line-strong bg-surface py-1.5 pl-2.5 pr-8 text-[13px] placeholder:text-faint focus:border-accent focus:outline-none"
              />
              {!query && (
                <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-line bg-raised px-1 text-[10px] text-faint">
                  /
                </kbd>
              )}
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-sm border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink-2 focus:border-accent focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as '' | StockState)}
              className="rounded-sm border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink-2 focus:border-accent focus:outline-none"
            >
              <option value="">Any status</option>
              <option value="ok">In stock</option>
              <option value="low">Low</option>
              <option value="out">Out of stock</option>
            </select>

            {filtersActive && (
              <button
                onClick={() => {
                  setQuery('')
                  setCategory('')
                  setStatus('')
                }}
                className="px-1.5 py-1 text-[12px] text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                Clear
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              <span className="num text-[12px] text-faint">
                {visible.length === items.length
                  ? `${items.length} items`
                  : `${visible.length} of ${items.length}`}
              </span>
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 rounded-sm bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover"
              >
                New item
                <kbd className="rounded-sm bg-white/20 px-1 text-[10px] font-normal">N</kbd>
              </button>
            </div>
          </div>
        </TopBar>
      }
    >
      <div className="p-4">
        <div className="overflow-hidden rounded-sm border border-line bg-surface">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-raised text-left">
                <th className="w-9 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = selected.size > 0 && !allVisibleSelected
                    }}
                    onChange={toggleAll}
                    aria-label="Select all"
                    className="h-3.5 w-3.5 accent-[var(--color-accent)]"
                  />
                </th>
                {COLUMNS.map((col) => (
                  <th key={col.key} className={`px-3 py-2 font-medium ${col.className}`}>
                    <button
                      onClick={() => toggleSort(col.key)}
                      className={`group inline-flex items-center gap-1 text-[11px] uppercase tracking-wide transition-colors ${
                        sort.key === col.key ? 'text-ink' : 'text-muted hover:text-ink'
                      } ${col.numeric ? 'flex-row-reverse' : ''}`}
                    >
                      {col.label}
                      <span
                        className={`text-[9px] ${
                          sort.key === col.key ? 'text-accent' : 'text-transparent group-hover:text-faint'
                        }`}
                      >
                        {sort.key === col.key && sort.dir === 'desc' ? '▼' : '▲'}
                      </span>
                    </button>
                  </th>
                ))}
                <th className="w-[112px] px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-line last:border-0">
                    <td colSpan={9} className="px-3 py-[9px]">
                      <div className="h-3.5 w-full animate-pulse rounded-sm bg-line/70" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                visible.map((item) => {
                  const state = stockState(item)
                  const isSelected = selected.has(item.id)
                  return (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/inventory/${item.id}`)}
                      className={`group cursor-pointer border-b border-line transition-colors last:border-0 ${
                        isSelected ? 'bg-accent-soft/50' : 'hover:bg-raised'
                      }`}
                    >
                      <td className="px-3 py-[7px]" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(item.id)}
                          aria-label={`Select ${item.sku}`}
                          className="h-3.5 w-3.5 accent-[var(--color-accent)]"
                        />
                      </td>
                      <td className="num px-3 py-[7px] text-[12px] text-ink-2">{item.sku}</td>
                      <td className="px-3 py-[7px]">
                        <div className="truncate font-medium text-ink">{item.name}</div>
                        <div className="text-[11px] text-faint">{item.categoryId?.name ?? 'Uncategorised'}</div>
                      </td>
                      <td className="num px-3 py-[7px] text-[12px] text-muted">{item.bin || '—'}</td>
                      <td className="truncate px-3 py-[7px] text-ink-2">{item.supplier || '—'}</td>

                      <td
                        className="px-3 py-[7px] text-right"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editing !== item.id) beginEdit(item)
                        }}
                      >
                        {editing === item.id ? (
                          <input
                            autoFocus
                            type="number"
                            min={0}
                            value={draftQty}
                            onChange={(e) => setDraftQty(e.target.value)}
                            onBlur={() => commitEdit(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitEdit(item)
                              if (e.key === 'Escape') setEditing(null)
                            }}
                            className="num w-16 rounded-sm border border-accent bg-surface px-1 py-0.5 text-right text-[13px] focus:outline-none"
                          />
                        ) : (
                          <span
                            className={`num inline-block w-16 rounded-sm px-1 py-0.5 text-right transition-colors group-hover:bg-line/60 ${
                              state === 'out' ? 'text-out' : state === 'low' ? 'text-low' : 'text-ink'
                            }`}
                            title="Click to edit"
                          >
                            {formatQty(item.quantity)}
                          </span>
                        )}
                      </td>

                      <td className="num px-3 py-[7px] text-right text-[12px] text-muted">
                        {formatQty(item.reorderPoint)}
                      </td>
                      <td className="px-3 py-[7px] text-[12px] text-faint">{timeAgo(item.updatedAt)}</td>
                      <td className="px-3 py-[7px]">
                        <StatusBadge state={state} />
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>

          {!loading && visible.length === 0 && (
            <div className="px-3 py-16 text-center">
              {error ? (
                <>
                  <p className="text-[13px] font-medium text-out">{error}</p>
                  <p className="mt-1 text-[12px] text-muted">
                    The API on port 3001 is not responding. Start it with{' '}
                    <code className="num rounded-sm bg-raised px-1 text-[11px]">npm run dev</code> and try again.
                  </p>
                  <button
                    onClick={refresh}
                    className="mt-3 rounded-sm border border-line-strong px-2.5 py-1 text-[12px] text-ink-2 hover:bg-raised"
                  >
                    Retry
                  </button>
                </>
              ) : filtersActive ? (
                <>
                  <p className="text-[13px] font-medium text-ink">No items match these filters</p>
                  <p className="mt-1 text-[12px] text-muted">
                    {query ? (
                      <>
                        Nothing for “{query}”. Check the SKU, or search by supplier or bin instead.
                      </>
                    ) : (
                      'Try widening the category or status filter.'
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setQuery('')
                      setCategory('')
                      setStatus('')
                    }}
                    className="mt-3 rounded-sm border border-line-strong px-2.5 py-1 text-[12px] text-ink-2 hover:bg-raised"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-medium text-ink">No stock on file yet</p>
                  <p className="mt-1 text-[12px] text-muted">
                    Add your first item, or run{' '}
                    <code className="num rounded-sm bg-raised px-1 text-[11px]">npm run seed</code> in the backend to
                    load sample warehouse stock.
                  </p>
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="mt-3 rounded-sm bg-accent px-2.5 py-1 text-[12px] font-medium text-white hover:bg-accent-hover"
                  >
                    Add an item
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 px-1 text-[11px] text-faint">
          Click a quantity to edit it inline · <kbd className="text-ink-2">/</kbd> to search ·{' '}
          <kbd className="text-ink-2">N</kbd> for a new item
        </p>
      </div>

      {selected.size > 0 && (
        <div className="animate-bar fixed bottom-5 left-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-sm border border-line-strong bg-ink px-2 py-1.5 text-white shadow-lg">
            <span className="num px-2 text-[12px] text-white/80">{selected.size} selected</span>
            <span className="mx-1 h-4 w-px bg-white/20" />
            <button
              onClick={() => router.push('/receive')}
              className="rounded-sm px-2 py-1 text-[12px] hover:bg-white/10"
            >
              Receive stock
            </button>
            <button
              onClick={deleteSelected}
              disabled={busy}
              className="rounded-sm px-2 py-1 text-[12px] text-out-soft hover:bg-out/80 disabled:opacity-60"
            >
              {busy ? 'Deleting…' : 'Delete'}
            </button>
            <span className="mx-1 h-4 w-px bg-white/20" />
            <button
              onClick={() => setSelected(new Set())}
              className="rounded-sm px-2 py-1 text-[12px] text-white/70 hover:bg-white/10"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {drawerOpen && (
        <QuickAddDrawer onClose={() => setDrawerOpen(false)} onCreated={() => setSelected(new Set())} />
      )}
    </AppShell>
  )
}
