'use client'

import { useState } from 'react'
import { AppShell, TopBar } from '@/components/AppShell'
import { authFetch } from '@/lib/authFetch'
import { API } from '@/lib/api'
import { useInventory } from '@/lib/store'

const FIELD =
  'w-full rounded-sm border border-line-strong bg-surface px-2 py-1.5 text-[13px] text-ink placeholder:text-faint focus:border-accent focus:outline-none'
const LABEL = 'mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted'

type Note = { tone: 'ok' | 'out'; text: string }

export default function AccountPage() {
  const { username } = useInventory()

  const [newUsername, setNewUsername] = useState('')
  const [usernamePassword, setUsernamePassword] = useState('')
  const [usernameNote, setUsernameNote] = useState<Note | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordNote, setPasswordNote] = useState<Note | null>(null)

  const submit = async (
    path: string,
    body: Record<string, string>,
    setNote: (note: Note) => void,
    onSuccess: () => void
  ) => {
    try {
      const res = await authFetch(`${API}/user/${path}`, { method: 'PUT', body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok || data.success === false) {
        setNote({ tone: 'out', text: data.error || data.message || 'Request failed.' })
        return
      }
      setNote({ tone: 'ok', text: data.message || 'Saved.' })
      onSuccess()
    } catch {
      setNote({ tone: 'out', text: 'Could not reach the server.' })
    }
  }

  const changeUsername = (e: React.FormEvent) => {
    e.preventDefault()
    submit('change-username', { newUsername, password: usernamePassword }, setUsernameNote, () => {
      setNewUsername('')
      setUsernamePassword('')
    })
  }

  const changePassword = (e: React.FormEvent) => {
    e.preventDefault()
    submit('change-password', { newPassword, password: currentPassword }, setPasswordNote, () => {
      setNewPassword('')
      setCurrentPassword('')
    })
  }

  const note = (n: Note | null) =>
    n && (
      <p
        className={`mt-3 rounded-sm px-2 py-1.5 text-[12px] ${
          n.tone === 'ok' ? 'bg-ok-soft text-ok' : 'bg-out-soft text-out'
        }`}
      >
        {n.text}
      </p>
    )

  return (
    <AppShell
      header={
        <TopBar>
          <div className="flex h-14 items-center gap-3 px-4">
            <h1 className="text-[13px] font-semibold">Account</h1>
            <span className="num text-[12px] text-faint">Signed in as {username}</span>
          </div>
        </TopBar>
      }
    >
      <div className="grid max-w-3xl grid-cols-2 gap-4 p-4">
        <section className="rounded-sm border border-line bg-surface">
          <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            Change username
          </h2>
          <form onSubmit={changeUsername} className="p-3">
            <div className="mb-3">
              <label className={LABEL} htmlFor="new-username">New username</label>
              <input
                id="new-username"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="username-password">Current password</label>
              <input
                id="username-password"
                type="password"
                required
                value={usernamePassword}
                onChange={(e) => setUsernamePassword(e.target.value)}
                className={FIELD}
              />
            </div>
            <button className="mt-3 rounded-sm bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover">
              Update username
            </button>
            {note(usernameNote)}
          </form>
        </section>

        <section className="rounded-sm border border-line bg-surface">
          <h2 className="border-b border-line bg-raised px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            Change password
          </h2>
          <form onSubmit={changePassword} className="p-3">
            <div className="mb-3">
              <label className={LABEL} htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={FIELD}
              />
            </div>
            <button className="mt-3 rounded-sm bg-accent px-2.5 py-1.5 text-[13px] font-medium text-white hover:bg-accent-hover">
              Update password
            </button>
            {note(passwordNote)}
          </form>
        </section>
      </div>
    </AppShell>
  )
}
