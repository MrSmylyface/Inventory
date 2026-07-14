'use client'

import { use, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell, TopBar } from '@/components/AppShell'
import { StatusBadge } from '@/components/StatusBadge'
import { useInventory } from '@/lib/store'
import {
  deleteItem,
  formatDateTime,
  formatMoney,
  formatQty,
  receiveStock,
  stockState,
  updateItem,
} from '@/lib/api'

const FIELD =
  'w-full rounded-sm border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink focus:border-accent focus:outline-none'
const LABEL = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted'

type Draft = {
  sku: string
  name: string
  categoryId: string
  supplier: string
  bin: string
  quantity: string
  reorderPoint: string
  price: string
}

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { items, categories, loading, applyItem, dropItem } = useInventory()
  const router = useRouter()

  const item = items.find((i) => i.id === id)

  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receiveQty, setReceiveQty] = useState('')

  // Reseed the form whenever the server hands back a newer version of the item —
  // on load, and after a save or a delivery is booked in. Keying on `updatedAt`
  // means your in-progress typing survives re-renders, but a stock movement you
  // just made can't leave a stale quantity sitting in the form ready to be saved
  // back over it.
  const [syncedAt, setSyncedAt] = useState<string | null>(null)
  if (item && syncedAt !== item.updatedAt) {
    setSyncedAt(item.updatedAt)
    setDraft({
      sku: item.sku,
      name: item.name,
      categoryId: item.categoryId?.id ?? '',
      supplier: item.supplier,
      bin: item.bin,
      quantity: String(item.quantity),
      reorderPoint: String(item.reorderPoint),
      price: String(item.price),
    })
  }

  const dirty = useMemo(() => {
    if (!item || !draft) return false
    return (
      draft.sku !== item.sku ||
      draft.name !== item.name ||
      draft.categoryId !== (item.categoryId?.id ?? '') ||
      draft.supplier !== item.supplier ||
      draft.bin !== item.bin ||
      Number(draft.quantity) !== item.quantity ||
      Number(draft.reorderPoint) !== item.reorderPoint ||
      Number(draft.price) !== item.price
    )
  }, [item, draft])

  if (loading && !item) {
    return (
      <AppShell header={<TopBar><div className="h-14" /></TopBar>}>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded-sm bg-line/60" />
          ))}
        </div>
      </AppShell>
    )
  }

  if (!item || !draft) {
    return (
      <AppShell header={<TopBar><div className="flex h-14 items-center px-4 text-[13px] text-muted">Item</div></TopBar>}>
        <div className="px-4 py-16 text-center">
          <p className="text-[13px] font-medium text-ink">That item is no longer on file</p>
          <p className="mt-1 text-[12px] text-muted">It may have been deleted by someone else on the floor.</p>
          <Link
            href="/inventory"
            className="mt-3 inline-block rounded-sm border border-line-strong px-2.5 py-1 text-[12px] text-ink-2 hover:bg-raised"
          >
            Back to inventory
          </Link>
        </div>
      </AppShell>
    )
  }

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((prev) => (prev ? { ...prev, [key]: e.target.value } : prev))

  const state = stockState(item)
  const stockValue = item.quantity * item.price

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      applyItem(
        await updateItem(item.id, {
          sku: draft.sku.trim(),
          name: draft.name.trim(),
          categoryId: draft.categoryId || null,
          supplier: draft.supplier.trim(),
          bin: draft.bin.trim(),
          quantity: Number(draft.quantity),
          reorderPoint: Number(draft.reorderPoint),
          price: Number(draft.price),
        })
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  const quickReceive = async () => {
    const qty = Number(receiveQty)
    if (!Number.isInteger(qty) || qty <= 0) return
    setError(null)
    try {
      applyItem(await receiveStock(item.id, qty))
      setReceiveQty('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not receive stock.')
    }
  }

  const remove = async () => {
    if (!confirm(`Delete ${item.sku}? This cannot be undone.`)) return
    try {
      await deleteItem(item.id)
      dropItem(item.id)
      router.push('/inventory')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the item.')
    }
  }

  return (
    <AppShell
      header={
        <TopBar>
          <div className="flex h-14 items-center gap-3 px-4">
            <Link href="/inventory" className="text-[12px] text-muted hover:text-ink">
              Inventory
            </Link>
            <span className="text-faint">/</span>
            <span className="num text-[12px] text-ink-2">{item.sku}</span>
            <StatusBadge state={state} />

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={remove}
                className="rounded-sm border border-line-strong px-2.5 py-1.5 text-[13px] text-out hover:bg-out-soft"
              >
                Delete
              </button>
              <button
                onClick={save}
                disabled={!dirty || saving}
                className="rounded-sm bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
              </button>
            </div>
          </div>
        </TopBar>
      }
    >
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-[17px] font-semibold tracking-tight text-ink">{item.name}</h1>
          <p className="mt-0.5 text-[12px] text-muted">
            {item.categoryId?.name ?? 'Uncategorised'} · Last updated {formatDateTime(item.updatedAt)}
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-sm border border-out/30 bg-out-soft px-2 py-1.5 text-[12px] text-out">{error}</p>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-4">
          <section className="rounded-sm border border-line bg-surface">
            <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              Item details
            </h2>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="col-span-2">
                <label className={LABEL} htmlFor="d-name">Description</label>
                <input id="d-name" value={draft.name} onChange={set('name')} className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="d-sku">SKU</label>
                <input id="d-sku" value={draft.sku} onChange={set('sku')} className={`${FIELD} num uppercase`} />
              </div>
              <div>
                <label className={LABEL} htmlFor="d-bin">Bin location</label>
                <input id="d-bin" value={draft.bin} onChange={set('bin')} className={`${FIELD} num uppercase`} />
              </div>
              <div>
                <label className={LABEL} htmlFor="d-cat">Category</label>
                <select id="d-cat" value={draft.categoryId} onChange={set('categoryId')} className={FIELD}>
                  <option value="">Uncategorised</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL} htmlFor="d-supplier">Supplier</label>
                <input id="d-supplier" value={draft.supplier} onChange={set('supplier')} className={FIELD} />
              </div>
              <div>
                <label className={LABEL} htmlFor="d-qty">On hand</label>
                <input id="d-qty" type="number" min={0} value={draft.quantity} onChange={set('quantity')} className={`${FIELD} num`} />
              </div>
              <div>
                <label className={LABEL} htmlFor="d-rop">Reorder point</label>
                <input id="d-rop" type="number" min={0} value={draft.reorderPoint} onChange={set('reorderPoint')} className={`${FIELD} num`} />
              </div>
              <div>
                <label className={LABEL} htmlFor="d-price">Unit price (£)</label>
                <input id="d-price" type="number" min={0} step="0.01" value={draft.price} onChange={set('price')} className={`${FIELD} num`} />
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-sm border border-line bg-surface">
              <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                Stock position
              </h2>
              <dl className="divide-y divide-line text-[13px]">
                <div className="flex items-baseline justify-between px-3 py-2">
                  <dt className="text-muted">On hand</dt>
                  <dd className="num text-[15px] font-medium">{formatQty(item.quantity)}</dd>
                </div>
                <div className="flex items-baseline justify-between px-3 py-2">
                  <dt className="text-muted">Reorder point</dt>
                  <dd className="num text-ink-2">{formatQty(item.reorderPoint)}</dd>
                </div>
                <div className="flex items-baseline justify-between px-3 py-2">
                  <dt className="text-muted">Stock value</dt>
                  <dd className="num text-ink-2">£{formatMoney(stockValue)}</dd>
                </div>
                <div className="flex items-baseline justify-between px-3 py-2">
                  <dt className="text-muted">Bin</dt>
                  <dd className="num text-ink-2">{item.bin || '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-sm border border-line bg-surface">
              <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
                Book in a delivery
              </h2>
              <div className="p-3">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={receiveQty}
                    onChange={(e) => setReceiveQty(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && quickReceive()}
                    placeholder="Qty"
                    className={`${FIELD} num`}
                  />
                  <button
                    onClick={quickReceive}
                    disabled={!receiveQty}
                    className="shrink-0 rounded-sm border border-line-strong px-2.5 py-1.5 text-[13px] text-ink-2 hover:bg-raised disabled:opacity-40"
                  >
                    Receive
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-faint">
                  Adds to the count on hand. For a multi-line delivery use{' '}
                  <Link href="/receive" className="text-accent hover:underline">
                    Receive stock
                  </Link>
                  .
                </p>
              </div>
            </section>

            <section className="rounded-sm border border-line bg-surface px-3 py-2 text-[12px]">
              <div className="flex justify-between py-1">
                <span className="text-muted">Created</span>
                <span className="text-ink-2">{formatDateTime(item.createdAt)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted">Updated</span>
                <span className="text-ink-2">{formatDateTime(item.updatedAt)}</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
