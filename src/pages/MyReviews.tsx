import { useNavigate } from 'react-router-dom';
import { FileEdit, ShieldCheck, AlertTriangle, ThumbsUp, Clock } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useMyReviews } from '../hooks/useProducts';

export default function MyReviews() {
  const navigate = useNavigate();
  const { data: reviews = [], loading } = useMyReviews();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <FileEdit className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <p className="text-sm text-gray-400">
              {loading ? 'Loading…' : `${reviews.length} review${reviews.length !== 1 ? 's' : ''} submitted from this device`}
            </p>
          </div>
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">✍️</p>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h2>
            <p className="text-sm text-gray-400 mb-5">
              Share your experience — your reviews help others make better choices.
            </p>
            <button
              onClick={() => navigate('/categories')}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {!loading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map(r => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all"
                onClick={() => navigate(`/product/${r.product_id}`)}
              >
                {/* Product header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{r.product_icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                      {r.product_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={r.rating} size="xs" />
                      <span className="text-[11px] text-gray-400">{r.date}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {r.status === 'pending' && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        <Clock className="w-3 h-3" /> Pending review
                      </span>
                    )}
                    {r.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {r.is_suspicious && (
                      <span className="flex items-center gap-1 text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      r.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600'
                      : r.sentiment === 'negative' ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {r.sentiment}
                    </span>
                  </div>
                </div>

                {r.title && (
                  <p className="text-sm font-semibold text-gray-800 mb-1">{r.title}</p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{r.body}</p>

                <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{r.helpful} found this helpful</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
