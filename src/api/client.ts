const BASE = import.meta.env.VITE_API_URL ?? ''
const TOKEN_KEY = 'rl_token'
const TIMEOUT_MS = 15_000

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function makeTimeout(): AbortSignal {
  return AbortSignal.timeout(TIMEOUT_MS)
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.error === 'string') return data.error
  } catch { /* ignore parse failure */ }
  return `Error ${res.status}`
}

function rethrowNetworkError(err: unknown): never {
  if (err instanceof ApiError) throw err
  const isTimeout = err instanceof Error && (err.name === 'AbortError' || err.name === 'TimeoutError')
  throw new ApiError(0, isTimeout ? 'Request timed out' : 'Network error — check your connection')
}

export async function apiFetch<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, { headers: authHeaders(), signal: makeTimeout() })
    if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res))
    return res.json() as Promise<T>
  } catch (err) {
    rethrowNetworkError(err)
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
      signal: makeTimeout(),
    })
    if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res))
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  } catch (err) {
    rethrowNetworkError(err)
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
      signal: makeTimeout(),
    })
    if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res))
    if (res.status === 204) return undefined as T
    return res.json() as Promise<T>
  } catch (err) {
    rethrowNetworkError(err)
  }
}

export async function apiDelete(path: string): Promise<void> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
      signal: makeTimeout(),
    })
    if (!res.ok) throw new ApiError(res.status, await extractErrorMessage(res))
  } catch (err) {
    rethrowNetworkError(err)
  }
}
