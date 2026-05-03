import { useNavigate } from 'react-router-dom';
import { X, Plus, Trophy } from 'lucide-react';
import StarRating from '../components/StarRating';
import { useStore } from '../store/useStore';
import { useProducts } from '../hooks/useProducts';

const aspectKeys   = ['camera', 'battery', 'performance', 'display'] as const;
const aspectLabels = { camera: 'Camera', battery: 'Battery', performance: 'Performance', display: 'Display' };

type AspectKey = typeof aspectKeys[number];

function getBestValue(values: number[]): number {
  return Math.max(...values.filter(v => v > 0));
}

export default function Compare() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useStore();
  const { data: allProducts = [], loading } = useProducts();

  const products    = allProducts.filter(p => compareList.includes(p.id));
  const suggestions = allProducts.filter(p => !compareList.includes(p.id)).slice(0, 4);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">{products.length} of 4 products selected</p>
          </div>
          {products.length > 0 && (
            <button onClick={clearCompare} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
              Clear All
            </button>
          )}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-gray-100 rounded-2xl h-64 animate-pulse" />
        )}

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center mb-6">
            <p className="text-5xl mb-4">⚖️</p>
            <h2 className="text-lg font-bold text-gray-900 mb-2">No products to compare</h2>
            <p className="text-sm text-gray-400 mb-4">Browse products and click Compare to add them here.</p>
            <button onClick={() => navigate('/categories')} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
              Browse Products
            </button>
          </div>
        )}

        {/* Comparison table */}
        {!loading && products.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-36">Feature</th>
                    {products.map(p => (
                      <th key={p.id} className="p-4 text-center min-w-[180px]">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${p.bgFrom} ${p.bgTo} flex items-center justify-center text-4xl mx-auto mb-2`}>
                          {p.icon}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{p.name}</p>
                        <StarRating rating={p.rating} size="xs" />
                        <p className="text-xs text-indigo-600 font-semibold mt-0.5">{p.priceRange}</p>
                        <button
                          onClick={() => removeFromCompare(p.id)}
                          className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 mx-auto transition-colors"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </th>
                    ))}
                    {products.length < 4 && (
                      <th className="p-4 text-center min-w-[160px]">
                        <button
                          onClick={() => navigate('/categories')}
                          className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto mb-2 hover:border-indigo-300 transition-colors group"
                        >
                          <Plus className="w-6 h-6 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </button>
                        <p className="text-xs text-gray-400">Add product</p>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {/* Overall rating */}
                  <tr className="border-b border-gray-50 bg-indigo-50/30">
                    <td className="p-4 text-sm font-semibold text-gray-700">Overall Rating</td>
                    {products.map(p => {
                      const best   = getBestValue(products.map(x => x.rating));
                      const isBest = p.rating === best;
                      return (
                        <td key={p.id} className="p-4 text-center">
                          <span className={`text-lg font-bold ${isBest ? 'text-indigo-600' : 'text-gray-700'}`}>{p.rating}</span>
                          {isBest && <Trophy className="w-4 h-4 text-amber-400 inline ml-1" />}
                        </td>
                      );
                    })}
                    {products.length < 4 && <td />}
                  </tr>

                  {/* Aspect rows */}
                  {aspectKeys.map((key, i) => {
                    const values = products.map(p => (p.aspects as Record<string, number>)[key] ?? 0);
                    const best   = getBestValue(values);
                    return (
                      <tr key={key} className={`border-b border-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                        <td className="p-4 text-sm font-medium text-gray-600">{aspectLabels[key]}</td>
                        {products.map(p => {
                          const score  = (p.aspects as Record<string, number>)[key] ?? 0;
                          const isBest = score > 0 && score === best;
                          return (
                            <td key={p.id} className="p-4 text-center">
                              {score > 0 ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-base font-bold ${isBest ? 'text-emerald-600' : 'text-gray-600'}`}>
                                    {score}
                                    {isBest && <Trophy className="w-3.5 h-3.5 text-amber-400 inline ml-1" />}
                                  </span>
                                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                                    <div className={`rounded-full h-1.5 ${isBest ? 'bg-emerald-500' : 'bg-gray-300'}`} style={{ width: `${(score / 5) * 100}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">N/A</span>
                              )}
                            </td>
                          );
                        })}
                        {products.length < 4 && <td />}
                      </tr>
                    );
                  })}

                  {/* Price row */}
                  <tr>
                    <td className="p-4 text-sm font-medium text-gray-600">Price</td>
                    {products.map(p => (
                      <td key={p.id} className="p-4 text-center text-sm font-semibold text-indigo-600">{p.priceRange}</td>
                    ))}
                    {products.length < 4 && <td />}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!loading && products.length < 4 && suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggested products to compare</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCompare(p.id)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-left hover:border-indigo-200 hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.bgFrom} ${p.bgTo} flex items-center justify-center text-2xl mb-2`}>
                    {p.icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.rating} ★</p>
                  <span className="text-[10px] text-indigo-600 font-medium mt-1 block">+ Add to compare</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
