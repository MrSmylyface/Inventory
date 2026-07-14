'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API } from '@/lib/api'
import { useLocalStorageValue } from '@/lib/useLocalStorageValue'

const FIELD =
  'w-full rounded-sm border border-line-strong bg-surface px-2.5 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none'
const LABEL = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted'

export default function VerifyPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  // Prefilled from the register step; `edited` takes over once the user types.
  const pendingUsername = useLocalStorageValue('pendingUsername') ?? ''
  const [edited, setEdited] = useState<string | null>(null)
  const username = edited ?? pendingUsername
  const setUsername = setEdited

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${API}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code }),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setError(data.error || 'That code was not accepted.')
        return
      }
      localStorage.removeItem('pendingUsername')
      router.push('/login')
    } catch {
      setError('Could not reach the server on port 3001.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[340px]">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-accent text-[12px] font-semibold text-white">
            SR
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-tight">Stockroom</div>
            <div className="text-[11px] text-faint">Bay 4 · Warehouse</div>
          </div>
        </div>

        <form onSubmit={submit} className="rounded-sm border border-line bg-surface p-4">
          <h1 className="mb-1 text-[13px] font-semibold">Verify your email</h1>
          <p className="mb-4 text-[12px] text-muted">Enter the 6-digit code we emailed you.</p>

          <div className="mb-3">
            <label className={LABEL} htmlFor="username">Username</label>
            <input
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="code">Verification code</label>
            <input
              id="code"
              required
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              className={`${FIELD} num tracking-[0.3em]`}
            />
          </div>

          {error && <p className="mt-3 rounded-sm bg-out-soft px-2 py-1.5 text-[12px] text-out">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-sm bg-accent py-2 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <p className="mt-3 text-[12px] text-muted">
          Back to <Link href="/login" className="text-accent hover:underline">sign in</Link>
        </p>
      </div>
    </div>
  )
}
