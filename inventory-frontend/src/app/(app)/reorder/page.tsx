'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AppShell, TopBar } from '@/components/AppShell'
import { StatusBadge } from '@/components/StatusBadge'
import { useInventory } from '@/lib/store'
import { formatMoney, formatQty, stockState, suggestedOrderQty, type Item } from '@/lib/api'

function Stat({ label, value, tone = 'ink' }: { label: string; value: string; tone?: 'ink' | 'low' | 'out' }) {
  const toneClass = tone === 'out' ? 'text-out' : tone === 'low' ? 'text-low' : 'text-ink'
  return (
    <div className="border-r border-line px-4 py-3 last:border-r-0">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`num mt-1 text-[19px] font-medium ${toneClass}`}>{value}</div>
    </div>
  )
}

export default function ReorderPage() {
  const { items, loading } = useInventory()
  const [copied, setCopied] = useState<string | null>(null)

  const needed = useMemo(
    () =>
      items
        .filter((i) => stockState(i) !== 'ok')
        .sort((a, b) => a.quantity - b.quantity || a.sku.localeCompare(b.sku)),
    [items]
  )

  const bySupplier = useMemo(() => {
    const groups = new Map<string, Item[]>()
    for (const item of needed) {
      const key = item.supplier || 'No supplier on file'
      const list = groups.get(key) ?? []
      list.push(item)
      groups.set(key, list)
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [needed])

  const outCount = needed.filter((i) => stockState(i) === 'out').length
  const estimatedCost = needed.reduce((sum, i) => sum + suggestedOrderQty(i) * i.price, 0)

  const copyOrder = async (supplier: string, group: Item[]) => {
    const lines = group.map((i) => `${i.sku}\t${i.name}\t${suggestedOrderQty(i)}`).join('\n')
    await navigator.clipboard.writeText(`Purchase order — ${supplier}\n${lines}`)
    setCopied(supplier)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <AppShell
      header={
        <TopBar>
          <div className="flex h-14 items-center gap-3 px-4">
            <h1 className="text-[13px] font-semibold">Reorder</h1>
            <span className="text-[12px] text-faint">Items at or below their reorder point</span>
          </div>
        </TopBar>
      }
    >
      <div className="p-4">
        <div className="mb-4 grid grid-cols-4 rounded-sm border border-line bg-surface">
          <Stat label="Needs reordering" value={formatQty(needed.length)} tone={needed.length ? 'low' : 'ink'} />
          <Stat label="Out of stock" value={formatQty(outCount)} tone={outCount ? 'out' : 'ink'} />
          <Stat label="Suppliers affected" value={formatQty(bySupplier.length)} />
          <Stat label="Est. order cost" value={`£${formatMoney(estimatedCost)}`} />
        </div>

        {!loading && needed.length === 0 && (
          <div className="rounded-sm border border-line bg-surface px-3 py-16 text-center">
            <p className="text-[13px] font-medium text-ink">Every line is above its reorder point</p>
            <p className="mt-1 text-[12px] text-muted">
              Nothing needs ordering today. This page fills up as stock is picked below the reorder points you set on
              each item.
            </p>
            <Link
              href="/inventory"
              className="mt-3 inline-block rounded-sm border border-line-strong px-2.5 py-1 text-[12px] text-ink-2 hover:bg-raised"
            >
              Back to inventory
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {bySupplier.map(([supplier, group]) => {
            const groupCost = group.reduce((sum, i) => sum + suggestedOrderQty(i) * i.price, 0)
            return (
              <section key={supplier} className="overflow-hidden rounded-sm border border-line bg-surface">
                <header className="flex items-center gap-3 border-b border-line bg-raised px-3 py-2">
                  <h2 className="text-[13px] font-medium text-ink">{supplier}</h2>
                  <span className="num text-[11px] text-faint">
                    {group.length} {group.length === 1 ? 'line' : 'lines'} · £{formatMoney(groupCost)}
                  </span>
                  <button
                    onClick={() => copyOrder(supplier, group)}
                    className="ml-auto rounded-sm border border-line-strong px-2 py-1 text-[12px] text-ink-2 hover:bg-surface"
                  >
                    {copied === supplier ? 'Copied' : 'Copy order list'}
                  </button>
                </header>

                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-muted">
                      <th className="w-[104px] px-3 py-2 font-medium">SKU</th>
                      <th className="px-3 py-2 font-medium">Description</th>
                      <th className="w-[84px] px-3 py-2 font-medium">Bin</th>
                      <th className="w-[88px] px-3 py-2 text-right font-medium">On hand</th>
                      <th className="w-[104px] whitespace-nowrap px-3 py-2 text-right font-medium">Reorder at</th>
                      <th className="w-[88px] px-3 py-2 text-right font-medium">Order qty</th>
                      <th className="w-[96px] px-3 py-2 text-right font-medium">Est. cost</th>
                      <th className="w-[112px] px-3 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((item) => {
                      const orderQty = suggestedOrderQty(item)
                      return (
                        <tr key={item.id} className="border-b border-line last:border-0 hover:bg-raised">
                          <td className="num px-3 py-[7px] text-[12px]">
                            <Link href={`/inventory/${item.id}`} className="text-ink-2 hover:text-accent hover:underline">
                              {item.sku}
                            </Link>
                          </td>
                          <td className="truncate px-3 py-[7px]">{item.name}</td>
                          <td className="num px-3 py-[7px] text-[12px] text-muted">{item.bin || '—'}</td>
                          <td
                            className={`num px-3 py-[7px] text-right font-medium ${
                              stockState(item) === 'out' ? 'text-out' : 'text-low'
                            }`}
                          >
                            {formatQty(item.quantity)}
                          </td>
                          <td className="num px-3 py-[7px] text-right text-muted">{formatQty(item.reorderPoint)}</td>
                          <td className="num px-3 py-[7px] text-right font-medium">{formatQty(orderQty)}</td>
                          <td className="num px-3 py-[7px] text-right text-ink-2">
                            £{formatMoney(orderQty * item.price)}
                          </td>
                          <td className="px-3 py-[7px]">
                            <StatusBadge state={stockState(item)} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </section>
            )
          })}
        </div>

        {needed.length > 0 && (
          <p className="mt-2 px-1 text-[11px] text-faint">
            Order quantity brings each line back to 1.5× its reorder point.
          </p>
        )}
      </div>
    </AppShell>
  )
}
