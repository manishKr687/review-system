import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { useStats, useRecommendations } from '../hooks/useProducts';

const WHAT_PEOPLE_LOVE = [
  'Camera quality',
  'Battery life',
  'Build quality',
  'Value for money',
  'Display clarity',
];

export default function ReviewSummaryPanel() {
  const navigate = useNavigate();
  const { data: stats } = useStats();
  const { data: recentProducts = [] } = useRecommendations('top_rated', 5);

  const overallRating = stats?.avg_rating ?? 0;
  const totalReviews  = stats?.total_reviews ?? 0;
  const starDist      = stats?.star_distribution ?? [];

  return (
    <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-100 overflow-y-auto">
      <div className="p-5 space-y-6">

        {/* ── Review Summary ── */}
        <section>
          <h3 className="font-bold text-gray-900 text-base mb-3">Review Summary</h3>

          <div className="flex items-end gap-2 mb-1">
            <span className="text-4xl font-extrabold text-gray-900 leading-none">
              {overallRating || '—'}
            </span>
            {overallRating > 0 && (
              <div className="pb-1">
                <StarRating rating={overallRating} size="lg" />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Based on {totalReviews.toLocaleString('en-IN')} reviews
          </p>

          <div className="space-y-2">
            {starDist.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
                ))
              : starDist.map(({ star, percent }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4 text-right flex-shrink-0">{star}</span>
                    <span className="text-amber-400 text-xs flex-shrink-0">★</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 rounded-full h-2" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-7 text-right flex-shrink-0">{percent}%</span>
                  </div>
                ))}
          </div>

          <button
            onClick={() => navigate('/categories')}
            className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-3 hover:text-indigo-800 transition-colors"
          >
            See all reviews <ArrowRight className="w-3 h-3" />
          </button>
        </section>

        <hr className="border-gray-100" />

        {/* ── What People Love ── */}
        <section>
          <h4 className="font-semibold text-gray-900 text-sm mb-3">What people love</h4>
          <div className="space-y-2">
            {WHAT_PEOPLE_LOVE.map(label => (
              <div key={label} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/search?q=best')}
            className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-3 hover:text-indigo-800 transition-colors"
          >
            View all insights <ArrowRight className="w-3 h-3" />
          </button>
        </section>

        <hr className="border-gray-100" />

        {/* ── Top Rated Products ── */}
        <section>
          <h4 className="font-semibold text-gray-900 text-sm mb-3">Top Rated</h4>
          <div className="space-y-3">
            {recentProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.bgFrom} ${item.bgTo} flex items-center justify-center text-lg flex-shrink-0`}>
                  {item.icon}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StarRating rating={item.rating} size="xs" />
                    <span className="text-[11px] text-gray-400">({item.reviewCount.toLocaleString()})</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/top-rated')}
            className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-3 hover:text-indigo-800 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </section>

      </div>
    </aside>
  );
}
