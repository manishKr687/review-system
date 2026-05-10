import { useNavigate, Link } from 'react-router-dom';
import {
  User, FileEdit, Heart, Clock, GitCompare,
  Star, ChevronRight, LogIn,
} from 'lucide-react';
import StarRating from '../components/StarRating';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { useMyReviews } from '../hooks/useProducts';

export default function Profile() {
  const navigate = useNavigate();
  const { watchlist, recentlyViewed, compareList } = useStore();
  const { user, isLoggedIn } = useAuthStore();
  const { data: reviews = [], loading } = useMyReviews();

  const displayName = user?.display_name ?? 'Guest';
  const initials = displayName
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const stats = [
    { icon: FileEdit,   label: 'Reviews',   value: reviews.length,         path: '/my-reviews',      color: 'text-indigo-600', bg: 'bg-indigo-50'  },
    { icon: Heart,      label: 'Saved',     value: watchlist.length,        path: '/watchlist',        color: 'text-rose-500',   bg: 'bg-rose-50'    },
    { icon: Clock,      label: 'Viewed',    value: recentlyViewed.length,   path: '/recently-viewed',  color: 'text-amber-600',  bg: 'bg-amber-50'   },
    { icon: GitCompare, label: 'Comparing', value: compareList.length,      path: '/compare',          color: 'text-emerald-600',bg: 'bg-emerald-50' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="h-full overflow-y-auto flex items-center justify-center">
        <div className="text-center py-20 px-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Sign in to view your profile</h2>
          <p className="text-sm text-gray-500 mb-6">Create an account to track your reviews and saved products.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
            <Link to="/register" className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-5">

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
            {initials || <User className="w-8 h-8" />}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{user?.email}</p>

            {avgRating && (
              <div className="flex items-center gap-1.5 mt-2">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm text-gray-600">
                  Average rating given: <span className="font-semibold text-gray-900">{avgRating}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Activity stats ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(s => (
            <button
              key={s.label}
              onClick={() => navigate(s.path)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className="text-2xl font-extrabold text-gray-900">{s.value}</span>
              <span className="text-xs text-gray-400 font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        {/* ── Recent reviews ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Recent Reviews</h2>
            {reviews.length > 3 && (
              <button
                onClick={() => navigate('/my-reviews')}
                className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loading && (
            <div className="p-5 space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && reviews.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-3xl mb-3">✍️</p>
              <p className="text-sm text-gray-500 mb-4">No reviews yet.</p>
              <button
                onClick={() => navigate('/categories')}
                className="text-sm text-indigo-600 font-medium hover:underline"
              >
                Browse products to review
              </button>
            </div>
          )}

          {!loading && reviews.length > 0 && (
            <div className="divide-y divide-gray-50">
              {reviews.slice(0, 3).map(r => (
                <div
                  key={r.id}
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/product/${r.product_id}`)}
                >
                  <span className="text-2xl flex-shrink-0">{r.product_icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{r.product_name}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {r.status === 'pending' && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                            Pending
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
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={r.rating} size="xs" />
                      <span className="text-[11px] text-gray-400">{r.date}</span>
                    </div>
                    {r.title && (
                      <p className="text-xs font-medium text-gray-700 mt-1">{r.title}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick links ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: '🔍', label: 'Browse Products',  sub: 'Explore all categories',           path: '/categories'      },
            { emoji: '❤️', label: 'My Watchlist',     sub: `${watchlist.length} saved products`, path: '/watchlist'       },
            { emoji: '⚖️', label: 'Compare',          sub: `${compareList.length} selected`,     path: '/compare'         },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all text-left"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400 truncate">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
