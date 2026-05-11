'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Theme = 'dark' | 'light'

const themes = {
  dark: {
    bg: 'bg-black',
    text: 'text-yellow-400',
    subtext: 'text-yellow-200',
    card: 'bg-gray-900',
    input: 'bg-gray-800 text-yellow-200 placeholder-gray-500',
    btnPrimary: 'bg-yellow-400 text-black hover:bg-yellow-300',
    btnSecondary: 'bg-gray-800 text-yellow-400 hover:bg-gray-700',
    btnDanger: 'bg-red-600 text-white hover:bg-red-700',
    headerBorder: 'border-yellow-400',
  },
  light: {
    bg: 'bg-white',
    text: 'text-gray-900',
    subtext: 'text-gray-600',
    card: 'bg-yellow-50',
    input: 'bg-yellow-100 text-gray-900 placeholder-gray-400',
    btnPrimary: 'bg-yellow-400 text-black hover:bg-yellow-300',
    btnSecondary: 'bg-yellow-100 text-gray-900 hover:bg-yellow-200',
    btnDanger: 'bg-red-500 text-white hover:bg-red-600',
    headerBorder: 'border-yellow-400',
  }
}

export default function Account() {
  const [username, setUsername] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [currentPasswordForUsername, setCurrentPasswordForUsername] = useState('')
  const [currentPasswordForPassword, setCurrentPasswordForPassword] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')
  const router = useRouter()
  const t = themes[theme]

  const getAuthHeader = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  })

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    router.push('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      router.push('/login')
      return
    }
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    const payload = JSON.parse(atob(token.split('.')[1]))
    setUsername(payload.username)
  }, [])

  const handleChangeUsername = async () => {
    if (!newUsername || !currentPasswordForUsername) {
      alert('Please fill in all fields')
      return
    }
    try {
      const response = await fetch('http://localhost:3001/api/user/change-username', {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ newUsername, password: currentPasswordForUsername })
      })
      const data = await response.json()
      if (data.error) {
        alert(data.error)
      } else {
        alert(data.message)
        setUsername(newUsername)
        setNewUsername('')
        setCurrentPasswordForUsername('')
      }
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !currentPasswordForPassword) {
      alert('Please fill in all fields')
      return
    }
    try {
      const response = await fetch('http://localhost:3001/api/user/change-password', {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ newPassword, password: currentPasswordForPassword })
      })
      const data = await response.json()
      if (data.error) {
        alert(data.error)
      } else {
        alert(data.message)
        setNewPassword('')
        setCurrentPasswordForPassword('')
      }
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
  }

  return (
    <div className={`min-h-screen p-8 ${t.bg} ${t.text}`}>
      <div className={`flex justify-between items-center mb-8 pb-4 border-b ${t.headerBorder}`}>
        <h1 className="text-2xl font-bold">Account</h1>
        <button onClick={() => router.push('/dashboard')} className={`px-4 py-2 rounded font-bold ${t.btnSecondary}`}>Back to Dashboard</button>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={`w-full max-w-md ${t.card} p-6 rounded-lg`}>
          <p className={`text-sm mb-1 ${t.subtext}`}>Logged in as</p>
          <p className="text-xl font-bold">{username}</p>
        </div>

        <div className={`w-full max-w-md ${t.card} p-6 rounded-lg flex flex-col gap-3`}>
          <h2 className="text-lg font-semibold">Change Username</h2>
          <input value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="New username" className={`p-2 rounded ${t.input}`} />
          <input value={currentPasswordForUsername} onChange={e => setCurrentPasswordForUsername(e.target.value)} type="password" placeholder="Current password" className={`p-2 rounded ${t.input}`} />
          <button onClick={handleChangeUsername} className={`px-4 py-2 rounded font-bold ${t.btnPrimary}`}>Update Username</button>
        </div>

        <div className={`w-full max-w-md ${t.card} p-6 rounded-lg flex flex-col gap-3`}>
          <h2 className="text-lg font-semibold">Change Password</h2>
          <input value={currentPasswordForPassword} onChange={e => setCurrentPasswordForPassword(e.target.value)} type="password" placeholder="Current password" className={`p-2 rounded ${t.input}`} />
          <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="New password" className={`p-2 rounded ${t.input}`} />
          <button onClick={handleChangePassword} className={`px-4 py-2 rounded font-bold ${t.btnPrimary}`}>Update Password</button>
        </div>

        <div className={`w-full max-w-md ${t.card} p-6 rounded-lg`}>
          <h2 className="text-lg font-semibold mb-3">Danger Zone</h2>
          <button onClick={logout} className={`w-full px-4 py-2 rounded font-bold ${t.btnDanger}`}>Logout</button>
        </div>
      </div>
    </div>
  )
}
