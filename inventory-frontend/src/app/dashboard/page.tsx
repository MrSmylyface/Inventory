'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authFetch } from '@/lib/authFetch'

type Item = { id: string; name: string; quantity: string; price: string }
type Theme = 'dark' | 'light'

const themes = {
  dark: {
    bg: 'bg-zinc-900',
    pageBg: 'bg-zinc-800',
    text: 'text-yellow-300',
    subtext: 'text-yellow-100',
    input: 'bg-zinc-900 text-white placeholder-gray-500 border border-zinc-700 focus:border-yellow-400 outline-none',
    border: 'border-zinc-700',
    headerBorder: 'border-yellow-400',
    header: 'bg-zinc-900',
    formBg: 'bg-zinc-800',
    tableBg: 'bg-zinc-900',
    btnPrimary: 'bg-yellow-400 text-black hover:bg-yellow-300 font-bold',
    btnSecondary: 'bg-zinc-800 text-yellow-300 border border-zinc-600 hover:border-yellow-400 hover:text-yellow-200',
    btnDanger: 'bg-red-600 text-white hover:bg-red-500',
    btnEdit: 'bg-yellow-500 text-black hover:bg-yellow-400',
    btnSave: 'bg-green-500 text-white hover:bg-green-400',
    btnCancel: 'bg-zinc-600 text-white hover:bg-zinc-500',
    row: 'hover:bg-zinc-900',
    switchTrack: 'bg-yellow-400',
  },
  light: {
    bg: 'bg-gray-100',
    pageBg: 'bg-gray-100',
    text: 'text-gray-900',
    subtext: 'text-gray-500',
    input: 'bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-yellow-500 outline-none',
    border: 'border-gray-200',
    headerBorder: 'border-yellow-500',
    header: 'bg-white',
    formBg: 'bg-yellow-50',
    tableBg: 'bg-yellow-50',
    btnPrimary: 'bg-yellow-500 text-black hover:bg-yellow-400 font-bold',
    btnSecondary: 'bg-white text-gray-800 border border-gray-300 hover:border-yellow-500 hover:text-gray-900',
    btnDanger: 'bg-red-600 text-white hover:bg-red-500',
    btnEdit: 'bg-yellow-500 text-black hover:bg-yellow-400',
    btnSave: 'bg-green-600 text-white hover:bg-green-500',
    btnCancel: 'bg-gray-300 text-gray-800 hover:bg-gray-400',
    row: 'hover:bg-yellow-50',
    switchTrack: 'bg-yellow-500',
  }
}

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([])
  const [itemname, setItemname] = useState('')
  const [itemquantity, setItemquantity] = useState('')
  const [itemprice, setItemprice] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [theme, setTheme] = useState<Theme>('dark')
  const router = useRouter()
  const t = themes[theme]

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
  }

  const seeInventory = async () => {
    try {
      const response = await authFetch('http://localhost:3001/api/inventory', {
        method: 'GET'
      })
      const data = await response.json()
      if (Array.isArray(data.data)) {
        setItems(data.data)
      } else {
        alert(data.message || 'Failed to load inventory')
      }
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
  }

  const addInventory = async () => {
    if (!itemname || !itemquantity || !itemprice) {
      alert('Please fill in all fields')
      return
    }
    try {
      const response = await authFetch('http://localhost:3001/api/inventory', {
        method: 'POST',
        body: JSON.stringify({ name: itemname, quantity: Number(itemquantity), price: Number(itemprice) })
      })
      const data = await response.json()
      setItems(prev => [...prev, data.data])
      setItemname('')
      setItemquantity('')
      setItemprice('')
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
  }

  const updateInventory = async (id: string) => {
    try {
      const response = await authFetch(`http://localhost:3001/api/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: itemname, quantity: Number(itemquantity), price: Number(itemprice) })
      })
      await response.json()
      setEditId(null)
      seeInventory()
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
  }

  const deleteInventory = async (id: string) => {
    try {
      await authFetch(`http://localhost:3001/api/inventory/${id}`, {
        method: 'DELETE'
      })
      setItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      alert('Network error. Please check your connection.')
    }
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
    seeInventory()
  }, [])

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.text}`}>
      {/* Header */}
      <div className={`flex justify-between items-center px-8 py-4 border-b ${t.headerBorder} ${t.header}`}>
        <h1 className="text-xl font-bold tracking-wide">Inventory</h1>
        <div className="flex items-center gap-4">
          {/* Theme switch */}
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${t.switchTrack}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-black rounded-full shadow transition-all duration-300 ${theme === 'light' ? 'left-7' : 'left-1'}`} />
            </button>
            <span className="text-lg">☀️</span>
          </div>
          <button onClick={() => router.push('/account')} className={`px-4 py-2 rounded-lg font-bold transition ${t.btnSecondary}`}>
            {username}
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Add item form */}
        <div className={`flex gap-3 mb-8 p-4 rounded-xl border ${t.border} ${t.formBg}`}>
          <input value={itemname} onChange={e => setItemname(e.target.value)} placeholder="Item name" className={`flex-1 p-2 rounded-lg ${t.input}`} />
          <input type="number" value={itemquantity} onChange={e => setItemquantity(e.target.value)} placeholder="Quantity" className={`w-28 p-2 rounded-lg ${t.input}`} />
          <input type="number" value={itemprice} onChange={e => setItemprice(e.target.value)} placeholder="Price" className={`w-28 p-2 rounded-lg ${t.input}`} />
          <button onClick={addInventory} className={`px-6 py-2 rounded-lg transition ${t.btnPrimary}`}>+ Add</button>
        </div>

        {/* Table */}
        <div className={`rounded-xl border ${t.border} overflow-hidden ${t.tableBg}`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${t.headerBorder} text-sm uppercase tracking-wider`}>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Price (₺)</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className={`px-4 py-8 text-center ${t.subtext}`}>No items yet. Add one above.</td>
                </tr>
              )}
              {items.map(item => (
                <tr key={item.id} className={`border-b ${t.border} ${t.row} transition`}>
                  {editId === item.id ? (
                    <>
                      <td className="px-4 py-2"><input value={itemname} onChange={e => setItemname(e.target.value)} className={`p-1 rounded-lg w-full ${t.input}`} /></td>
                      <td className="px-4 py-2"><input type="number" value={itemquantity} onChange={e => setItemquantity(e.target.value)} className={`p-1 rounded-lg w-full ${t.input}`} /></td>
                      <td className="px-4 py-2"><input type="number" value={itemprice} onChange={e => setItemprice(e.target.value)} className={`p-1 rounded-lg w-full ${t.input}`} /></td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => updateInventory(item.id)} className={`px-3 py-1 rounded-lg transition ${t.btnSave}`}>Save</button>
                        <button onClick={() => setEditId(null)} className={`px-3 py-1 rounded-lg transition ${t.btnCancel}`}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-bold">{item.name}</td>
                      <td className="px-4 py-3 font-bold">{item.quantity}</td>
                      <td className="px-4 py-3 font-bold">{item.price}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button onClick={() => { setEditId(item.id); setItemname(item.name); setItemquantity(item.quantity); setItemprice(item.price) }} className={`px-3 py-1 rounded-lg transition ${t.btnEdit}`}>Edit</button>
                        <button onClick={() => deleteInventory(item.id)} className={`px-3 py-1 rounded-lg transition ${t.btnDanger}`}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
