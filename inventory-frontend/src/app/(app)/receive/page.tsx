'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AppShell, TopBar } from '@/components/AppShell'
import { useInventory } from '@/lib/store'
import { formatQty, receiveStock, stockState, type Item } from '@/lib/api'

const FIELD =
  'w-full rounded-sm border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none'
const LABEL = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted'

type Line = { item: Item; qty: string }
type Receipt = { reference: string; lines: { sku: string; name: string; qty: number; newQty: number }[] }

export default function ReceivePage() {
  const { items, loading, applyItem } = useInventory()

  const [reference, setReference] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [query, setQuery] = useState('')
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const pickerRef = useRef<HTMLInputElement>(null)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const taken = new Set(lines.map((l) => l.item.id))
    return items
      .filter((i) => !taken.has(i.id))
      .filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q))
      .slice(0, 6)
  }, [items, query, lines])

  const addLine = (item: Item) => {
    setLines((prev) => [...prev, { item, qty: '' }])
    setQuery('')
    pickerRef.current?.focus()
  }

  const setQty = (id: string, qty: string) =>
    setLines((prev) => prev.map((l) => (l.item.id === id ? { ...l, qty } : l)))

  const removeLine = (id: string) => setLines((prev) => prev.filter((l) => l.item.id !== id))

  const totalUnits = lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0)
  const bookable = lines.filter((l) => Number(l.qty) > 0)

  const book = async () => {
    setBooking(true)
    setError(null)
    try {
      const booked: Receipt['lines'] = []
      // Sequential on purpose: a goods-in clerk needs to know exactly which line
      // failed, not have four of five silently applied.
      for (const line of bookable) {
        const qty = Number(line.qty)
        const updated = await receiveStock(line.item.id, qty)
        applyItem(updated)
        booked.push({ sku: updated.sku, name: updated.name, qty, newQty: updated.quantity })
      }
      setReceipt({ reference: reference.trim(), lines: booked })
      setLines([])
      setReference('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not book in the delivery.')
    } finally {
      setBooking(false)
    }
  }

  if (receipt) {
    const units = receipt.lines.reduce((s, l) => s + l.qty, 0)
    return (
      <AppShell
        header={
          <TopBar>
            <div className="flex h-14 items-center px-4">
              <h1 className="text-[13px] font-semibold">Receive stock</h1>
            </div>
          </TopBar>
        }
      >
        <div className="p-4">
          <div className="max-w-2xl rounded-sm border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line bg-ok-soft px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-ok-dot" />
              <h2 className="text-[13px] font-medium text-ok">
                Booked in {formatQty(units)} units across {receipt.lines.length}{' '}
                {receipt.lines.length === 1 ? 'line' : 'lines'}
              </h2>
              {receipt.reference && (
                <span className="num ml-auto text-[12px] text-ok">Ref {receipt.reference}</span>
              )}
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="px-3 py-2 text-right font-medium">Received</th>
                  <th className="px-3 py-2 text-right font-medium">New on hand</th>
                </tr>
              </thead>
              <tbody>
                {receipt.lines.map((line) => (
                  <tr key={line.sku} className="border-b border-line last:border-0">
                    <td className="num px-3 py-2 text-[12px] text-ink-2">{line.sku}</td>
                    <td className="truncate px-3 py-2">{line.name}</td>
                    <td className="num px-3 py-2 text-right text-ok">+{formatQty(line.qty)}</td>
                    <td className="num px-3 py-2 text-right font-medium">{formatQty(line.newQty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setReceipt(null)}
              className="rounded-sm bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover"
            >
              Receive another delivery
            </button>
            <Link
              href="/inventory"
              className="rounded-sm border border-line-strong px-2.5 py-1.5 text-[13px] text-ink-2 hover:bg-raised"
            >
              Back to inventory
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      header={
        <TopBar>
          <div className="flex h-14 items-center gap-3 px-4">
            <h1 className="text-[13px] font-semibold">Receive stock</h1>
            <span className="text-[12px] text-faint">Book a supplier delivery into Bay 4</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="num text-[12px] text-faint">
                {lines.length} {lines.length === 1 ? 'line' : 'lines'} · {formatQty(totalUnits)} units
              </span>
              <button
                onClick={book}
                disabled={bookable.length === 0 || booking}
                className="rounded-sm bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {booking ? 'Booking in…' : 'Book in delivery'}
              </button>
            </div>
          </div>
        </TopBar>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_280px] gap-4 p-4">
        <div>
          <div className="relative mb-3">
            <label className={LABEL} htmlFor="picker">
              Add a line — scan or type a SKU
            </label>
            <input
              id="picker"
              ref={pickerRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions.length > 0) addLine(suggestions[0])
              }}
              placeholder="FST-1042"
              autoComplete="off"
              className={`${FIELD} num`}
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-sm border border-line-strong bg-surface shadow-lg">
                {suggestions.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => addLine(item)}
                      className="flex w-full items-center gap-3 border-b border-line px-3 py-2 text-left last:border-0 hover:bg-accent-soft"
                    >
                      <span className="num w-[88px] shrink-0 text-[12px] text-ink-2">{item.sku}</span>
                      <span className="flex-1 truncate text-[13px]">{item.name}</span>
                      <span className="num shrink-0 text-[12px] text-faint">{item.bin || '—'}</span>
                      {index === 0 && (
                        <kbd className="shrink-0 rounded-sm border border-line bg-raised px-1 text-[10px] text-faint">
                          ↵
                        </kbd>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="overflow-hidden rounded-sm border border-line bg-surface">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-raised text-left text-[11px] uppercase tracking-wide text-muted">
                  <th className="w-[104px] px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Description</th>
                  <th className="w-[84px] px-3 py-2 font-medium">Bin</th>
                  <th className="w-[88px] px-3 py-2 text-right font-medium">On hand</th>
                  <th className="w-[96px] px-3 py-2 text-right font-medium">Receiving</th>
                  <th className="w-[88px] px-3 py-2 text-right font-medium">New total</th>
                  <th className="w-9 px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const qty = Number(line.qty) || 0
                  return (
                    <tr key={line.item.id} className="border-b border-line last:border-0 hover:bg-raised">
                      <td className="num px-3 py-[7px] text-[12px] text-ink-2">{line.item.sku}</td>
                      <td className="truncate px-3 py-[7px]">{line.item.name}</td>
                      <td className="num px-3 py-[7px] text-[12px] text-muted">{line.item.bin || '—'}</td>
                      <td className="num px-3 py-[7px] text-right text-muted">{formatQty(line.item.quantity)}</td>
                      <td className="px-3 py-[7px] text-right">
                        <input
                          autoFocus
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) => setQty(line.item.id, e.target.value)}
                          placeholder="0"
                          className="num w-16 rounded-sm border border-line-strong bg-surface px-1 py-0.5 text-right text-[13px] focus:border-accent focus:outline-none"
                        />
                      </td>
                      <td className="num px-3 py-[7px] text-right font-medium">
                        {qty > 0 ? formatQty(line.item.quantity + qty) : '—'}
                      </td>
                      <td className="px-3 py-[7px] text-right">
                        <button
                          onClick={() => removeLine(line.item.id)}
                          aria-label={`Remove ${line.item.sku}`}
                          className="rounded-sm px-1 text-[13px] text-faint hover:bg-line/60 hover:text-out"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {lines.length === 0 && (
              <div className="px-3 py-14 text-center">
                <p className="text-[13px] font-medium text-ink">No lines on this delivery yet</p>
                <p className="mt-1 text-[12px] text-muted">
                  {loading
                    ? 'Loading stock…'
                    : 'Scan a barcode or type a SKU above. Press ↵ to add the top match.'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="mt-3 rounded-sm border border-out/30 bg-out-soft px-2 py-1.5 text-[12px] text-out">
              {error} Lines already booked in have been saved.
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-sm border border-line bg-surface">
            <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              Delivery
            </h2>
            <div className="p-3">
              <label className={LABEL} htmlFor="ref">
                Delivery note ref
              </label>
              <input
                id="ref"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="DN-48213"
                className={`${FIELD} num`}
              />
              <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px]">
                <div className="flex justify-between">
                  <dt className="text-muted">Lines</dt>
                  <dd className="num">{lines.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Units in</dt>
                  <dd className="num font-medium">{formatQty(totalUnits)}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section className="rounded-sm border border-line bg-surface">
            <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              Awaiting stock
            </h2>
            <ul className="divide-y divide-line">
              {items
                .filter((i) => stockState(i) === 'out')
                .slice(0, 5)
                .map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => addLine(item)}
                      disabled={lines.some((l) => l.item.id === item.id)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-raised disabled:opacity-40"
                    >
                      <span className="min-w-0">
                        <span className="num block text-[12px] text-ink-2">{item.sku}</span>
                        <span className="block truncate text-[12px] text-muted">{item.name}</span>
                      </span>
                      <span className="shrink-0 text-[11px] text-accent">Add</span>
                    </button>
                  </li>
                ))}
              {items.filter((i) => stockState(i) === 'out').length === 0 && (
                <li className="px-3 py-4 text-center text-[12px] text-muted">Nothing is out of stock.</li>
              )}
            </ul>
          </section>
        </aside>
      </div>
    </AppShell>
  )
}
