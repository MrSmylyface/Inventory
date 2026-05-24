async function tryRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return false
  try {
    const res = await fetch('http://localhost:3001/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })
    if (!res.ok) return false
    const data = await res.json()
    if (!data.data?.accessToken) return false
    localStorage.setItem('accessToken', data.data.accessToken)
    return true
  } catch {
    return false
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const makeHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    ...(options.headers as Record<string, string> ?? {})
  })

  let res = await fetch(url, { ...options, headers: makeHeaders() })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (!refreshed) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
      return res
    }
    res = await fetch(url, { ...options, headers: makeHeaders() })
  }

  return res
}
