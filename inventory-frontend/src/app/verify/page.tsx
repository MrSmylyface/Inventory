'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Verify() {
  const [code, setCode] = useState('')
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

  const handleVerify = async () => {
    const username = localStorage.getItem('pendingUsername')
    try {
      const response = await fetch('http://localhost:3001/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, code })
      })
      const data = await response.json()
      alert(data.message || data.error)
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
        <h1 className={`text-3xl font-bold mb-2 text-center ${text}`}>Verify email</h1>
        <p className={`text-center text-sm mb-8 ${subtext}`}>Enter the code sent to your email</p>
        <div className="flex flex-col gap-4">
          <input value={code} onChange={e => setCode(e.target.value)} type="text" placeholder="Verification code" className={`p-3 rounded-lg w-full ${input}`} />
          <button onClick={handleVerify} className={`p-3 rounded-lg transition ${btn}`}>Verify</button>
        </div>
        <p className={`text-center text-sm mt-6 ${subtext}`}>
          Back to{' '}
          <span onClick={() => router.push('/login')} className={`cursor-pointer font-semibold ${link}`}>Login</span>
        </p>
      </div>
    </div>
  )
}
