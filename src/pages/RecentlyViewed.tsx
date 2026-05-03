import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { useProducts } from '../hooks/useProducts';

export default function RecentlyViewed() {
  const navigate = useNavigate();
  const { recentlyViewed } = useStore();
  const { data: allProducts = [], loading } = useProducts();

  const products = recentlyViewed
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) as typeof allProducts;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recently Viewed</h1>
            <p className="text-sm text-gray-400">{products.length} product{products.length !== 1 ? 's' : ''}</p>
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
            <p className="text-5xl mb-4">👀</p>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Nothing viewed yet</h2>
            <p className="text-sm text-gray-400 mb-5">
              Products you open will appear here for quick access.
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
