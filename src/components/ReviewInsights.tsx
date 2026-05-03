import { useStats } from '../hooks/useProducts';

export default function ReviewInsights() {
  const { data: stats } = useStats();

  const insights = stats ? [
    { value: stats.total_reviews.toLocaleString(), label: 'Reviews Analyzed',  icon: '📊', color: 'text-indigo-600' },
    { value: `${stats.positive_pct}%`,              label: 'Positive Sentiment', icon: '😊', color: 'text-emerald-600' },
    { value: stats.avg_rating.toFixed(1),           label: 'Average Rating',     icon: '⭐', color: 'text-amber-500'  },
    { value: stats.total_products.toLocaleString(), label: 'Products Tracked',   icon: '📦', color: 'text-violet-600' },
  ] : [];

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-lg font-bold text-gray-900">Review Insights</h2>
        <p className="text-xs text-gray-400 mt-0.5">AI-powered analysis from thousands of reviews</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {insights.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
            ))
          : insights.map(({ value, label, icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <span className="text-3xl flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className={`text-2xl font-extrabold leading-none ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-tight">{label}</p>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}
