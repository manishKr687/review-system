import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/useProducts';

export default function CategoryPills() {
  const navigate = useNavigate();
  const { data: categories = [], loading } = useCategories();

  if (loading) {
    return (
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-40 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" />
        ))}
      </div>
    );
  }

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
          </div>
        </button>
      ))}

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
