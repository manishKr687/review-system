import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Lock } from 'lucide-react'
import { storeKey, verifyAdminKey, AdminApiError } from '../../api/admin'

export default function AdminLogin() {
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!key.trim()) return
    setLoading(true)
    setError('')
    try {
      await verifyAdminKey(key.trim())
      storeKey(key.trim())
      navigate('/admin')
    } catch (err) {
      setError(err instanceof AdminApiError && err.status === 401
        ? 'Incorrect admin key.'
        : 'Could not reach the API. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">ReviewLens</p>
            <p className="text-[11px] text-gray-400">Admin Panel</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your admin key to continue.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Admin Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="••••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !key.trim()}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Verifying…' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  )
}
