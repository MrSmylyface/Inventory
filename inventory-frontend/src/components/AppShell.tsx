'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useInventory } from '@/lib/store'

const NAV = [
  { href: '/inventory', label: 'Inventory', key: 'inventory' },
  { href: '/receive', label: 'Receive stock', key: 'receive' },
  { href: '/reorder', label: 'Reorder', key: 'reorder' },
]

function NavIcon({ name, className }: { name: string; className: string }) {
  const common = {
    className,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  if (name === 'inventory') {
    return (
      <svg {...common}>
        <path d="M2 4.5 8 2l6 2.5M2 4.5v7L8 14l6-2.5v-7M2 4.5 8 7m6-2.5L8 7m0 0v7" />
      </svg>
    )
  }
  if (name === 'receive') {
    return (
      <svg {...common}>
        <path d="M8 2v7m0 0 3-3M8 9 5 6M2.5 10v2.5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V10" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M8 2.5v4M8 11.5h.01M2.6 13h10.8a1 1 0 0 0 .86-1.5L8.86 2.6a1 1 0 0 0-1.72 0L1.74 11.5A1 1 0 0 0 2.6 13Z" />
    </svg>
  )
}

export function AppShell({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { username, lowCount } = useInventory()

  const signOut = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.replace('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-sidebar">
        <div className="flex h-14 items-center gap-2 border-b border-line px-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-accent text-[11px] font-semibold text-white">
            SR
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold tracking-tight">Stockroom</div>
            <div className="text-[11px] text-faint">Bay 4 · Warehouse</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 p-2">
          {NAV.map((entry) => {
            const active = pathname === entry.href || pathname.startsWith(`${entry.href}/`)
            return (
              <Link
                key={entry.href}
                href={entry.href}
                className={`flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors ${
                  active
                    ? 'bg-accent-soft font-medium text-accent'
                    : 'text-ink-2 hover:bg-line/60 hover:text-ink'
                }`}
              >
                <NavIcon name={entry.key} className={`h-4 w-4 ${active ? 'text-accent' : 'text-faint'}`} />
                <span className="flex-1">{entry.label}</span>
                {entry.key === 'reorder' && lowCount > 0 && (
                  <span className="num rounded-sm bg-low-soft px-1 py-px text-[11px] font-medium text-low">
                    {lowCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-line p-2">
          <Link
            href="/account"
            className={`flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[13px] transition-colors ${
              pathname === '/account' ? 'bg-accent-soft font-medium text-accent' : 'text-ink-2 hover:bg-line/60'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-line-strong text-[10px] font-semibold text-ink-2">
              {(username || '?').slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate">{username || 'Account'}</span>
          </Link>
          <button
            onClick={signOut}
            className="w-full rounded-sm px-2.5 py-1.5 text-left text-[13px] text-muted transition-colors hover:bg-line/60 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}

/** Sticky top bar. Pages fill it with their own search, filters and actions. */
export function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-sm">
      {children}
    </header>
  )
}
