import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { useProducts } from '../hooks/useProducts';

export default function Watchlist() {
  const navigate      = useNavigate();
  const { watchlist } = useStore();
  const { data: allProducts = [], loading } = useProducts();

  const products = allProducts.filter(p => watchlist.includes(p.id));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-sm text-gray-400">{products.length} saved product{products.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-5xl mb-4">🔖</p>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your watchlist is empty</h2>
            <p className="text-sm text-gray-400 mb-5">
              Save products you're interested in to review them later.
              Click the <Heart className="w-4 h-4 inline text-red-400" /> icon on any product card.
            </p>
            <button
              onClick={() => navigate('/categories')}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} showActions />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
