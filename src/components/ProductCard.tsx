import { ArrowRight } from 'lucide-react';
import StarRating from './StarRating';
import { type Product } from '../data/mockData';

interface ProductCardProps {
  product: Product;
}

const rankBadgeColor: Record<number, string> = {
  1: 'bg-amber-500',
  2: 'bg-orange-400',
  3: 'bg-orange-400',
  4: 'bg-gray-300',
};

// Simple inline SVG phone for product cards
function MiniPhone({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 110" className="w-16 h-auto drop-shadow-md" fill="none">
      <rect x="4" y="2" width="52" height="106" rx="10" fill={color} />
      <rect x="8" y="12" width="44" height="82" rx="6" fill="white" opacity="0.15" />
      <rect x="20" y="6" width="20" height="4" rx="2" fill="black" opacity="0.3" />
      <rect x="4" y="30" width="2" height="10" rx="1" fill={color} style={{ filter: 'brightness(0.7)' }} />
      <rect x="4" y="44" width="2" height="12" rx="1" fill={color} style={{ filter: 'brightness(0.7)' }} />
      <circle cx="30" cy="100" r="4" fill="white" opacity="0.2" />
    </svg>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const badgeColor = rankBadgeColor[product.rank] ?? 'bg-gray-300';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

      {/* Image area */}
      <div className={`relative bg-gradient-to-br ${product.bgFrom} ${product.bgTo} h-44 flex items-center justify-center`}>
        {/* Rank badge */}
        <div className={`absolute top-3 left-3 w-7 h-7 rounded-lg ${badgeColor} flex items-center justify-center text-white text-sm font-bold shadow`}>
          {product.rank}
        </div>
        <MiniPhone color={product.phoneColor} />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>

        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={product.rating} size="xs" />
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <p className="text-xs text-gray-400 italic leading-relaxed mb-3 flex-1">
          "{product.quote}"
        </p>

        <button className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors mb-3">
          View all reviews
          <ArrowRight className="w-3 h-3" />
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
