import { useEffect, useState } from 'react'
import { Star, ShieldAlert, CheckCircle2, XCircle, Trash2, AlertTriangle } from 'lucide-react'
import {
  fetchPendingReviews,
  approveReview,
  rejectReview,
  adminDeleteReview,
  type AdminReview,
} from '../../api/admin'

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          className={`w-3.5 h-3.5 ${n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </span>
  )
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, string> = {
    positive: 'bg-emerald-50 text-emerald-700',
    negative: 'bg-red-50 text-red-700',
    neutral: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${map[sentiment] ?? map.neutral}`}>
      {sentiment}
    </span>
  )
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Record<number, boolean>>({})
  const [verifiedMap, setVerifiedMap] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchPendingReviews()
      .then(setReviews)
      .finally(() => setLoading(false))
  }, [])

  async function handleApprove(id: number) {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await approveReview(id, verifiedMap[id] ?? false)
      setReviews(rs => rs.filter(r => r.id !== id))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  async function handleReject(id: number) {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await rejectReview(id)
      setReviews(rs => rs.filter(r => r.id !== id))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  async function handleDelete(id: number) {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await adminDeleteReview(id)
      setReviews(rs => rs.filter(r => r.id !== id))
    } finally {
      setBusy(b => ({ ...b, [id]: false }))
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-5 h-5 text-amber-500" />
        <div>
          <h1 className="text-lg font-bold text-gray-900">Review Moderation</h1>
          <p className="text-xs text-gray-400">Suspicious reviews held for approval before going live</p>
        </div>
        {!loading && (
          <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {reviews.length} pending
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading…</div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          <p className="font-medium text-gray-700">All clear — no pending reviews</p>
          <p className="text-xs text-gray-400">New suspicious submissions will appear here</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(r => (
          <div key={r.id} className="bg-white rounded-xl border border-amber-100 shadow-sm p-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-indigo-600 truncate">{r.product_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm font-medium text-gray-900">{r.author}</p>
                  <StarRow rating={r.rating} />
                  <SentimentBadge sentiment={r.sentiment} />
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {r.is_suspicious && (
                  <span className="flex items-center gap-1 text-[11px] bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                    <AlertTriangle className="w-3 h-3" /> Suspicious
                  </span>
                )}
                <span className="text-[11px] text-gray-400">{r.date}</span>
              </div>
            </div>

            {/* Body */}
            {r.title && <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">{r.body}</p>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none mr-auto">
                <input
                  type="checkbox"
                  checked={verifiedMap[r.id] ?? false}
                  onChange={e => setVerifiedMap(m => ({ ...m, [r.id]: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Mark as Verified Purchase
              </label>

              <button
                onClick={() => handleDelete(r.id)}
                disabled={busy[r.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
              <button
                onClick={() => handleReject(r.id)}
                disabled={busy[r.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
              <button
                onClick={() => handleApprove(r.id)}
                disabled={busy[r.id]}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-40"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
