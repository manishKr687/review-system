import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Trophy } from 'lucide-react';
import { useState } from 'react';
import StarRating from '../components/StarRating';
import { searchProducts } from '../data/mockData';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate        = useNavigate();
  const initialQuery    = searchParams.get('q') ?? '';
  const [localQuery, setLocalQuery] = useState(initialQuery);

  const results  = searchProducts(initialQuery);
  const hasQuery = initialQuery.trim().length > 0;

  const handleSearch = () => {
    const q = localQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">

        {/* Search bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 shadow-sm transition-all">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder='Try "best laptop for gaming" or "Sony headphones"'
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            Search
          </button>
        </div>

        {/* Results header */}
        {hasQuery && (
          <div className="mb-4">
            <h1 className="text-lg font-bold text-gray-900">
              {results.length > 0
                ? <>Results for <span className="text-indigo-600">"{initialQuery}"</span></>
                : <>No results for <span className="text-gray-500">"{initialQuery}"</span></>
              }
            </h1>
            {results.length > 0 && (
              <p className="text-sm text-gray-400 mt-0.5">{results.length} products found</p>
            )}
          </div>
        )}

        {/* Empty / no query state */}
        {!hasQuery && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium text-gray-600">Search for products</p>
            <p className="text-sm mt-1">Try "best phone under 30000" or "gaming laptop"</p>
          </div>
        )}

        {/* No results */}
        {hasQuery && results.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">😕</p>
            <p className="text-lg font-medium text-gray-600">No products found</p>
            <p className="text-sm mt-1">Try different keywords or browse categories</p>
            <button
              onClick={() => navigate('/categories')}
              className="mt-4 text-sm text-indigo-600 font-medium hover:underline"
            >
              Browse all categories →
            </button>
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((product, index) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer group"
              >
                {/* Best match badge */}
                {index === 0 && (
                  <div className="absolute">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 -mt-8 ml-2">
                      <Trophy className="w-3 h-3" /> Best Match
                    </span>
                  </div>
                )}

                {/* Product image */}
                <div className={`w-16 h-16 flex-shrink-0 rounded-xl bg-gradient-to-br ${product.bgFrom} ${product.bgTo} flex items-center justify-center text-3xl`}>
                  {product.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {index === 0 && (
                      <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Best Match
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{product.brand} · {product.category}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={product.rating} size="sm" />
                    <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">"{product.quote}"</p>
                </div>

                {/* Right side */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-indigo-600">{product.priceRange}</p>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors mt-2 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
