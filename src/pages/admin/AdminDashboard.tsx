import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, MessageSquare, ThumbsUp, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react'
import {
  fetchAdminStats,
  triggerAnalysis,
  AdminApiError,
  type AdminStats,
} from '../../api/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysisState, setAnalysisState] = useState<'idle' | 'running' | 'done'>('idle')
  const [taskId, setTaskId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(err => {
        if (err instanceof AdminApiError && err.status === 401) navigate('/admin/login')
      })
      .finally(() => setLoading(false))
  }, [navigate])

  async function handleRunAnalysis() {
    setAnalysisState('running')
    try {
      const res = await triggerAnalysis()
      setTaskId(res.task_id)
      // Poll until success
      const poll = setInterval(async () => {
        const base = import.meta.env.VITE_API_URL ?? ''
        const r = await fetch(`${base}/api/analyse/status/${res.task_id}`)
        const data = await r.json()
        if (data.status === 'success') {
          clearInterval(poll)
          setAnalysisState('done')
          // Refresh stats
          const newStats = await fetchAdminStats()
          setStats(newStats)
        }
      }, 2000)
    } catch {
      setAnalysisState('idle')
    }
  }

  const sentimentColors: Record<string, string> = {
    positive: 'bg-emerald-500',
    neutral:  'bg-gray-400',
    negative: 'bg-red-400',
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview and controls</p>
        </div>

        {/* Re-analyse button */}
        <button
          onClick={handleRunAnalysis}
          disabled={analysisState === 'running'}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            analysisState === 'done'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60'
          }`}
        >
          {analysisState === 'running' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running NLP…</>
          ) : analysisState === 'done' ? (
            <><CheckCircle2 className="w-4 h-4" /> Analysis complete</>
          ) : (
            <><RefreshCw className="w-4 h-4" /> Run NLP Analysis</>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : stats ? (
        <div className="space-y-6">

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={<Package className="w-5 h-5 text-indigo-500" />}
              label="Total Products"
              value={stats.total_products.toLocaleString()}
              bg="bg-indigo-50"
            />
            <StatCard
              icon={<MessageSquare className="w-5 h-5 text-violet-500" />}
              label="Total Reviews"
              value={stats.total_reviews.toLocaleString()}
              bg="bg-violet-50"
            />
            <StatCard
              icon={<ThumbsUp className="w-5 h-5 text-emerald-500" />}
              label="Positive Sentiment"
              value={
                stats.total_reviews > 0
                  ? `${Math.round(((stats.sentiment_breakdown.positive ?? 0) / stats.total_reviews) * 100)}%`
                  : '—'
              }
              bg="bg-emerald-50"
            />
          </div>

          {/* Sentiment breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Sentiment Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(stats.sentiment_breakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([label, count]) => {
                  const pct = stats.total_reviews > 0
                    ? Math.round((count / stats.total_reviews) * 100)
                    : 0
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="capitalize text-sm text-gray-600 w-20">{label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`${sentimentColors[label] ?? 'bg-gray-400'} h-2 rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">
                        {count.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Products by Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(stats.categories).map(([cat, count]) => (
                <div key={cat} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{cat}</span>
                  <span className="text-sm font-bold text-indigo-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {taskId && (
            <p className="text-xs text-gray-400">Last task ID: <code>{taskId}</code></p>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">Failed to load stats.</p>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, bg }: {
  icon: React.ReactNode
  label: string
  value: string
  bg: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
