import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, GitCompare, CheckCircle2, XCircle, Lightbulb, ShieldCheck, ThumbsUp, AlertTriangle, PenLine } from 'lucide-react';
import WriteReviewModal from '../components/WriteReviewModal';
import StarRating from '../components/StarRating';
import { useStore } from '../store/useStore';
import { useProduct, useReviews } from '../hooks/useProducts';

type Tab = 'overview' | 'reviews';
type ReviewFilter = 'all' | 'positive' | 'negative' | 'verified';

const aspectLabels: Record<string, string> = {
  camera: 'Camera', battery: 'Battery', performance: 'Performance',
  display: 'Display', audio: 'Audio', build: 'Build', value: 'Value',
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [showWriteModal, setShowWriteModal] = useState(false);

  const { toggleWatchlist, isInWatchlist, addToCompare, isInCompare } = useStore();

  const productId = Number(id);
  const { data: product, loading: productLoading, error: productError } = useProduct(productId);
  const { data: reviewsRaw }    = useReviews(productId, reviewFilter);
  const { data: allReviewsRaw } = useReviews(productId);
  const reviews    = reviewsRaw    ?? [];
  const allReviews = allReviewsRaw ?? [];

  if (productLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-2xl">😕</p>
        <p className="text-gray-500 font-medium">Product not found</p>
        {productError && <p className="text-xs text-red-400 max-w-sm text-center">{productError}</p>}
        <button onClick={() => navigate('/')} className="text-indigo-600 text-sm font-medium hover:underline">
          ← Back to Home
        </button>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(product.id);
  const inCompare   = isInCompare(product.id);
  const aspects     = Object.entries(product.aspects).filter(([, v]) => v > 0);

  return (
    <>
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-8">

          {/* Product image */}
          <div className={`flex-shrink-0 w-52 h-52 rounded-2xl bg-gradient-to-br ${product.bgFrom} ${product.bgTo} flex items-center justify-center text-8xl`}>
            {product.icon}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {product.brand} · {product.category}
                </p>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                <p className="text-indigo-600 font-semibold mt-1">{product.priceRange}</p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleWatchlist(product.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    inWatchlist
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={inWatchlist ? 'currentColor' : 'none'} />
                  {inWatchlist ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => { addToCompare(product.id); navigate('/compare'); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    inCompare
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  <GitCompare className="w-4 h-4" />
                  {inCompare ? 'In Compare' : 'Compare'}
                </button>
                <button
                  onClick={() => setShowWriteModal(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-indigo-200 hover:text-indigo-600 transition-all"
                >
                  <PenLine className="w-4 h-4" />
                  Write a Review
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 mt-4">
              <span className="text-4xl font-extrabold text-gray-900">{product.rating}</span>
              <div>
                <StarRating rating={product.rating} size="lg" />
                <p className="text-xs text-gray-400 mt-0.5">{product.reviewCount.toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Aspect bars */}
            <div className="mt-4 space-y-2">
              {aspects.map(([key, score]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24 flex-shrink-0">{aspectLabels[key] ?? key}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 rounded-full h-2 transition-all" style={{ width: `${(score / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 w-6 text-right">{score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['overview', 'reviews'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'reviews' ? `Reviews (${allReviews.length})` : 'Overview'}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (product.pros.length > 0 || product.cons.length > 0) && (
          <div className="space-y-6">
            {/* Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Pros
                </h3>
                <ul className="space-y-2">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" /> Cons
                </h3>
                <ul className="space-y-2">
                  {product.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Highlights */}
            {product.highlights.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" /> Review Highlights
                </h3>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-amber-400 flex-shrink-0">›</span> "{h}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Reviews tab */}
        {tab === 'reviews' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex gap-2">
              {(['all', 'positive', 'negative', 'verified'] as ReviewFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setReviewFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                    reviewFilter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {f === 'verified' ? '✓ Verified Only' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400 self-center">{reviews.length} reviews</span>
            </div>

            {/* Review cards */}
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-400">No reviews match this filter.</div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {review.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{review.author}</span>
                          {review.verified && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-medium">
                              <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {review.isSuspicious && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium" title="Our AI flagged this review as potentially unreliable">
                              <AlertTriangle className="w-3 h-3" /> Suspicious
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={review.rating} size="xs" />
                          <span className="text-[11px] text-gray-400">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                      review.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600'
                      : review.sentiment === 'negative' ? 'bg-red-50 text-red-500'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                      {review.sentiment}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{review.text}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{review.helpfulVotes} found this helpful</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>

    {showWriteModal && (
      <WriteReviewModal
        onClose={() => setShowWriteModal(false)}
        prefilledProduct={{ id: product.id, name: product.name }}
      />
    )}
    </>
  );
}
