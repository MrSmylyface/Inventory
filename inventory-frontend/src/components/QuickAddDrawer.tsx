'use client'

import { useEffect, useState } from 'react'
import { createItem, type Item } from '@/lib/api'
import { useInventory } from '@/lib/store'

const FIELD =
  'w-full rounded-sm border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none'
const LABEL = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted'

type Draft = {
  sku: string
  name: string
  categoryId: string
  quantity: string
  reorderPoint: string
  price: string
  supplier: string
  bin: string
}

const EMPTY: Draft = {
  sku: '',
  name: '',
  categoryId: '',
  quantity: '',
  reorderPoint: '',
  price: '',
  supplier: '',
  bin: '',
}

/** Mounted only while open, so a fresh draft comes free with the mount. */
export function QuickAddDrawer({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (item: Item) => void
}) {
  const { categories, applyItem } = useInventory()
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((prev) => ({ ...prev, [key]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const item = await createItem({
        sku: draft.sku.trim(),
        name: draft.name.trim(),
        quantity: Number(draft.quantity || 0),
        price: Number(draft.price || 0),
        reorderPoint: Number(draft.reorderPoint || 0),
        supplier: draft.supplier.trim(),
        bin: draft.bin.trim(),
        categoryId: draft.categoryId || null,
      })
      applyItem(item)
      onCreated(item)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    // No dimming scrim — the list stays readable while you type, an invisible
    // catcher just handles click-away.
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
      <aside className="animate-drawer fixed inset-y-0 right-0 z-40 flex w-[380px] flex-col border-l border-line-strong bg-surface shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.18)]">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <div>
            <h2 className="text-[13px] font-semibold">New item</h2>
            <p className="text-[11px] text-faint">Added to Bay 4 stock</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm px-1.5 py-0.5 text-[11px] text-muted hover:bg-line/60 hover:text-ink"
          >
            Esc
          </button>
        </div>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL} htmlFor="qa-sku">
                  SKU
                </label>
                <input
                  id="qa-sku"
                  autoFocus
                  required
                  value={draft.sku}
                  onChange={set('sku')}
                  placeholder="FST-1050"
                  className={`${FIELD} num uppercase`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="qa-bin">
                  Bin
                </label>
                <input
                  id="qa-bin"
                  value={draft.bin}
                  onChange={set('bin')}
                  placeholder="A-01-3"
                  className={`${FIELD} num uppercase`}
                />
              </div>
            </div>

            <div>
              <label className={LABEL} htmlFor="qa-name">
                Description
              </label>
              <input
                id="qa-name"
                required
                value={draft.name}
                onChange={set('name')}
                placeholder="M10 Hex Bolt, Zinc — 60mm (Box of 100)"
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL} htmlFor="qa-cat">
                Category
              </label>
              <select id="qa-cat" value={draft.categoryId} onChange={set('categoryId')} className={FIELD}>
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={LABEL} htmlFor="qa-qty">
                  On hand
                </label>
                <input
                  id="qa-qty"
                  type="number"
                  min={0}
                  required
                  value={draft.quantity}
                  onChange={set('quantity')}
                  placeholder="0"
                  className={`${FIELD} num`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="qa-rop">
                  Reorder at
                </label>
                <input
                  id="qa-rop"
                  type="number"
                  min={0}
                  value={draft.reorderPoint}
                  onChange={set('reorderPoint')}
                  placeholder="0"
                  className={`${FIELD} num`}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="qa-price">
                  Unit price
                </label>
                <input
                  id="qa-price"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={draft.price}
                  onChange={set('price')}
                  placeholder="0.00"
                  className={`${FIELD} num`}
                />
              </div>
            </div>

            <div>
              <label className={LABEL} htmlFor="qa-supplier">
                Supplier
              </label>
              <input
                id="qa-supplier"
                value={draft.supplier}
                onChange={set('supplier')}
                placeholder="Halloran Fixings"
                className={FIELD}
              />
            </div>

            {error && (
              <p className="rounded-sm border border-out/30 bg-out-soft px-2 py-1.5 text-[12px] text-out">{error}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-line px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-line-strong px-3 py-1.5 text-[13px] text-ink-2 hover:bg-raised"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Add item'}
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
