'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [dark, setDark] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      setDark(saved === 'dark')
    } else {
      setDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      if (data.tokens) {
        localStorage.setItem('accessToken', data.tokens.accessToken)
        localStorage.setItem('refreshToken', data.tokens.refreshToken)
        router.push('/dashboard')
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
  }

  const bg = dark ? 'bg-zinc-800' : 'bg-gray-100'
  const card = dark ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-yellow-200'
  const text = dark ? 'text-yellow-300' : 'text-gray-900'
  const subtext = dark ? 'text-yellow-100' : 'text-gray-500'
  const input = dark
    ? 'bg-zinc-800 text-white placeholder-gray-500 border border-zinc-600 focus:border-yellow-400 outline-none'
    : 'bg-yellow-50 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-yellow-500 outline-none'
  const btn = dark ? 'bg-yellow-400 text-black hover:bg-yellow-300 font-bold' : 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold'
  const link = dark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-500'

  return (
    <div className={`flex min-h-screen items-center justify-center ${bg}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-xl ${card}`}>
        <h1 className={`text-3xl font-bold mb-2 text-center ${text}`}>Welcome back</h1>
        <p className={`text-center text-sm mb-8 ${subtext}`}>Log in to your account</p>
        <div className="flex flex-col gap-4">
          <input value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="Username" className={`p-3 rounded-lg w-full ${input}`} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className={`p-3 rounded-lg w-full ${input}`} />
          <button onClick={handleLogin} className={`p-3 rounded-lg transition ${btn}`}>Login</button>
        </div>
        <p className={`text-center text-sm mt-6 ${subtext}`}>
          Don't have an account?{' '}
          <span onClick={() => router.push('/register')} className={`cursor-pointer font-semibold ${link}`}>Sign up</span>
        </p>
        <p className={`text-center text-sm mt-2 ${subtext}`}>
          Need to verify?{' '}
          <span onClick={() => router.push('/verify')} className={`cursor-pointer font-semibold ${link}`}>Verify email</span>
        </p>
      </div>
    </div>
  )
}
