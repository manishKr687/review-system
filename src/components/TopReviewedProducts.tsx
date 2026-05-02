import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useRecommendations } from '../hooks/useProducts';
import type { RecommendationType } from '../api/products';

const TABS: { label: string; type: RecommendationType }[] = [
  { label: 'Overall Best', type: 'top_rated'  },
  { label: 'Best Value',   type: 'best_value' },
  { label: 'Top Rated',    type: 'top_rated'  },
  { label: 'Trending',     type: 'trending'   },
];

export default function TopReviewedProducts() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { type } = TABS[activeTab];

  const { data: products = [], loading } = useRecommendations(type, 8);

  return (
    <section>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Top Reviewed Products</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Explore the highest rated products based on real user reviews
          </p>
        </div>
        <button
          onClick={() => navigate('/categories')}
          className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors mt-1"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab group */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="relative">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <button className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:border-indigo-300 hover:shadow-lg transition-all">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </section>
  );
}
