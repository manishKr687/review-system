import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categories } from '../data/mockData';

function formatCount(n: number) {
  return n.toLocaleString() + ' reviews';
}

export default function CategoryPills() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => navigate(`/categories?category=${encodeURIComponent(cat.name)}`)}
          className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex-shrink-0 group"
        >
          <span className="text-2xl">{cat.icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {cat.name}
            </p>
            <p className="text-xs text-gray-400">{formatCount(cat.reviewCount)}</p>
          </div>
        </button>
      ))}

      {/* View all */}
      <button
        onClick={() => navigate('/categories')}
        className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all flex-shrink-0 text-sm font-semibold text-indigo-600"
      >
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <ArrowRight className="w-4 h-4" />
        </div>
        View all
      </button>
    </div>
  );
}
