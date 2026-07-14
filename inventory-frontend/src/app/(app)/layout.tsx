'use client'

import { InventoryProvider } from '@/lib/store'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <InventoryProvider>{children}</InventoryProvider>
}
