import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProducts, useCategories } from '../hooks/useProducts';

type SortOption = 'best' | 'rated' | 'reviews' | 'az';
type PriceRange = 'all' | 'under20' | '20to50' | '50to80' | 'above80';
type MinRating  = 'all' | '4.5' | '4.0' | '3.5';

const sortLabels: Record<SortOption, string> = {
  best: 'Overall Best', rated: 'Highest Rated', reviews: 'Most Reviewed', az: 'A → Z',
};

function priceInRange(priceRange: string, filter: PriceRange): boolean {
  const num = parseInt(priceRange.replace(/[^\d]/g, ''));
  if (filter === 'under20') return num < 20000;
  if (filter === '20to50')  return num >= 20000 && num < 50000;
  if (filter === '50to80')  return num >= 50000 && num < 80000;
  if (filter === 'above80') return num >= 80000;
  return true;
}

export default function CategoryBrowse() {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const categoryParam = searchParams.get('category') ?? '';
  const defaultSort: SortOption = pathname === '/top-rated' ? 'rated' : 'best';

  const [activeCategory, setActiveCategory] = useState(categoryParam || 'All');
  const [sort,      setSort]      = useState<SortOption>(defaultSort);

  useEffect(() => {
    if (categoryParam) setActiveCategory(categoryParam);
  }, [categoryParam]);
  const [price,     setPrice]     = useState<PriceRange>('all');
  const [minRating, setMinRating] = useState<MinRating>('all');

  const { data: allProducts = [] } = useProducts();
  const { data: categoriesData = [] } = useCategories();

  const filtered = useMemo(() => {
    let list = activeCategory === 'All'
      ? allProducts
      : allProducts.filter(p => p.category === activeCategory);

    if (price !== 'all')     list = list.filter(p => priceInRange(p.priceRange, price));
    if (minRating !== 'all') list = list.filter(p => p.rating >= parseFloat(minRating));

    if (sort === 'rated')   return [...list].sort((a, b) => b.rating - a.rating);
    if (sort === 'reviews') return [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    if (sort === 'az')      return [...list].sort((a, b) => a.name.localeCompare(b.name));
    return [...list].sort((a, b) => b.rating - a.rating);
  }, [activeCategory, sort, price, minRating, allProducts]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Categories</h1>
          <p className="text-sm text-gray-400 mt-1">{filtered.length} products found</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['All', ...categoriesData.map(c => c.name)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter sidebar */}
          <aside className="w-full md:w-52 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 text-sm mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-500" /> Filters
              </h3>

              {/* Price range */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range</p>
                {([['all', 'All Prices'], ['under20', 'Under ₹20k'], ['20to50', '₹20k – ₹50k'], ['50to80', '₹50k – ₹80k'], ['above80', '₹80k+']] as [PriceRange, string][]).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                    <input
                      type="radio" name="price" value={val}
                      checked={price === val}
                      onChange={() => setPrice(val)}
                      className="accent-indigo-600"
                    />
                    <span className="text-xs text-gray-600">{label}</span>
                  </label>
                ))}
              </div>

              {/* Min rating */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Min Rating</p>
                {([['all', 'All Ratings'], ['4.5', '4.5 ★ & above'], ['4.0', '4.0 ★ & above'], ['3.5', '3.5 ★ & above']] as [MinRating, string][]).map(([val, label]) => (
                  <label key={val} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                    <input
                      type="radio" name="rating" value={val}
                      checked={minRating === val}
                      onChange={() => setMinRating(val)}
                      className="accent-indigo-600"
                    />
                    <span className="text-xs text-gray-600">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-800">{filtered.length}</span> products</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Sort:</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-300 bg-white text-gray-700"
                >
                  {(Object.entries(sortLabels) as [SortOption, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-medium">No products match your filters</p>
                <button onClick={() => { setPrice('all'); setMinRating('all'); }} className="mt-3 text-sm text-indigo-600 hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(product => (
                  <ProductCard key={product.id} product={product} showActions />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
