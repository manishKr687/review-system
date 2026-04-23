import { useState } from 'react';
import { SlidersHorizontal, ArrowRight, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { topProducts } from '../data/mockData';

const tabs = ['Overall Best', 'Best Value', 'Top Rated', 'Trending'];

export default function TopReviewedProducts() {
  const [activeTab, setActiveTab] = useState('Overall Best');

  return (
    <section>

      {/* Section header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Top Reviewed Products</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Explore the highest rated products based on real user reviews
          </p>
        </div>
        <button className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors mt-1">
          View all <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab group + Filters */}
      <div className="flex items-center justify-between mt-4 mb-4">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Product grid + scroll arrow */}
      <div className="relative">
        <div className="grid grid-cols-4 gap-4">
          {topProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right scroll arrow */}
        <button className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:border-indigo-300 hover:shadow-lg transition-all">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

    </section>
  );
}
