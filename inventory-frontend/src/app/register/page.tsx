'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { API } from '@/lib/api'

const FIELD =
  'w-full rounded-sm border border-line-strong bg-surface px-2.5 py-2 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none'
const LABEL = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setError(data.error || 'Could not create the account.')
        return
      }
      localStorage.setItem('pendingUsername', username)
      router.push('/verify')
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
          <h1 className="mb-1 text-[13px] font-semibold">Create an account</h1>
          <p className="mb-4 text-[12px] text-muted">We email a 6-digit code to confirm it&apos;s you.</p>

          <div className="mb-3">
            <label className={LABEL} htmlFor="username">Username</label>
            <input
              id="username"
              required
              minLength={3}
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={FIELD}
            />
          </div>

          <div className="mb-3">
            <label className={LABEL} htmlFor="email">Work email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={FIELD}
            />
            <p className="mt-1 text-[11px] text-faint">At least 6 characters.</p>
          </div>

          {error && <p className="mt-3 rounded-sm bg-out-soft px-2 py-1.5 text-[12px] text-out">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-sm bg-accent py-2 text-[13px] font-medium text-white hover:bg-accent-hover disabled:opacity-60"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="mt-3 text-[12px] text-muted">
          Already have one?{' '}
          <Link href="/login" className="text-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
