import { STOCK_LABEL, type StockState } from '@/lib/api'

const STYLES: Record<StockState, { chip: string; dot: string }> = {
  ok: { chip: 'bg-ok-soft text-ok', dot: 'bg-ok-dot' },
  low: { chip: 'bg-low-soft text-low', dot: 'bg-low-dot' },
  out: { chip: 'bg-out-soft text-out', dot: 'bg-out-dot' },
}

export function StatusBadge({ state }: { state: StockState }) {
  const style = STYLES[state]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${style.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {STOCK_LABEL[state]}
    </span>
  )
}
