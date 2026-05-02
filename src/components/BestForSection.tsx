import { useNavigate } from 'react-router-dom';
import { Camera, Gamepad2, Plane } from 'lucide-react';
import StarRating from './StarRating';
import { useRecommendations } from '../hooks/useProducts';
import type { RecommendationType } from '../api/products';

const USE_CASES: {
  type: RecommendationType;
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
}[] = [
  {
    type: 'photography',
    label: 'Best for Photography',
    description: 'Highest camera scores across all categories',
    icon: Camera,
    accent: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-100',
  },
  {
    type: 'gaming',
    label: 'Best for Gaming',
    description: 'Top performance & display scores',
    icon: Gamepad2,
    accent: 'text-indigo-600',
    bg: 'bg-indigo-50 border-indigo-100',
  },
  {
    type: 'travel',
    label: 'Best for Travel',
    description: 'Outstanding battery life & build quality',
    icon: Plane,
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-100',
  },
];

function UseCaseCard({
  type, label, description, icon: Icon, accent, bg,
}: (typeof USE_CASES)[number]) {
  const navigate = useNavigate();
  const { data: products = [], loading } = useRecommendations(type, 3);

  return (
    <div className={`rounded-2xl border p-5 ${bg} flex flex-col gap-4`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{label}</h3>
          <p className="text-[11px] text-gray-500">{description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-white/60 rounded-xl animate-pulse" />
            ))
          : products.map((p, i) => (
              <button
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2 hover:shadow-sm transition-all text-left group"
              >
                <span className="text-lg flex-shrink-0">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                    {p.name}
                  </p>
                  <StarRating rating={p.rating} size="xs" />
                </div>
                <span className={`text-[10px] font-bold ${accent} flex-shrink-0`}>
                  #{i + 1}
                </span>
              </button>
            ))}
      </div>
    </div>
  );
}

export default function BestForSection() {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900">Best For…</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Top picks matched to specific use cases
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {USE_CASES.map(uc => <UseCaseCard key={uc.type} {...uc} />)}
      </div>
    </section>
  );
}
