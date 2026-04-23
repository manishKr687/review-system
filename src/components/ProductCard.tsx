import { ArrowRight, Heart, GitCompare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import { useStore } from '../store/useStore';
import { type Product } from '../data/mockData';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const rankBadgeColor: Record<number, string> = {
  1: 'bg-amber-500',
  2: 'bg-orange-400',
  3: 'bg-orange-400',
  4: 'bg-gray-300',
};

export default function ProductCard({ product, showActions = false }: ProductCardProps) {
  const navigate = useNavigate();
  const { toggleWatchlist, isInWatchlist, addToCompare, isInCompare } = useStore();
  const inWatchlist = isInWatchlist(product.id);
  const inCompare   = isInCompare(product.id);
  const badgeColor  = rankBadgeColor[product.rank] ?? 'bg-gray-300';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

      {/* Image area */}
      <div
        className={`relative bg-gradient-to-br ${product.bgFrom} ${product.bgTo} h-44 flex items-center justify-center cursor-pointer`}
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <div className={`absolute top-3 left-3 w-7 h-7 rounded-lg ${badgeColor} flex items-center justify-center text-white text-sm font-bold shadow`}>
          {product.rank}
        </div>
        <span className="text-7xl drop-shadow">{product.icon}</span>

        {/* Quick action buttons */}
        {showActions && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            <button
              onClick={e => { e.stopPropagation(); toggleWatchlist(product.id); }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shadow transition-colors ${inWatchlist ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'}`}
            >
              <Heart className="w-3.5 h-3.5" fill={inWatchlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); addToCompare(product.id); }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center shadow transition-colors ${inCompare ? 'bg-indigo-600 text-white' : 'bg-white text-gray-400 hover:text-indigo-600'}`}
            >
              <GitCompare className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-semibold text-gray-900 text-sm mb-1 truncate cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={product.rating} size="xs" />
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <p className="text-xs text-gray-400 italic leading-relaxed mb-3 flex-1">
          "{product.quote}"
        </p>

        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors mb-3"
        >
          View all reviews <ArrowRight className="w-3 h-3" />
        </button>

        <div className="pt-2 border-t border-gray-50">
          <p className="text-[11px] text-gray-400">
            {product.reviewCount.toLocaleString()} reviews analyzed
          </p>
        </div>
      </div>

    </div>
  );
}
