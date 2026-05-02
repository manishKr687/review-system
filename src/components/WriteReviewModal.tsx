import { useState } from 'react';
import { X, Star, Loader2, CheckCircle2 } from 'lucide-react';
import { API_ENABLED, submitReview } from '../api/products';
import { useSearch } from '../hooks/useProducts';
import type { Product } from '../data/mockData';

interface Props {
  onClose: () => void;
  prefilledProduct?: { id: number; name: string };
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="focus:outline-none"
        >
          <Star
            className={`w-7 h-7 transition-colors ${
              n <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ProductSearch({ onSelect }: { onSelect: (p: Product) => void }) {
  const [query, setQuery] = useState('');
  const { data: results = [] } = useSearch(query);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search for a product…"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
      />
      {query.trim() && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {results.map(p => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => { onSelect(p); setQuery(''); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 text-left transition-colors"
              >
                <span className="text-xl">{p.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.brand} · {p.category}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim() && results.length === 0 && (
        <p className="absolute mt-1 w-full text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-xl py-3 shadow">
          No products found
        </p>
      )}
    </div>
  );
}

export default function WriteReviewModal({ onClose, prefilledProduct }: Props) {
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(
    prefilledProduct ?? null
  );
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = selectedProduct && author.trim() && rating > 0 && body.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      if (API_ENABLED) {
        await submitReview(selectedProduct!.id, { author, rating, title, body });
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Write a Review</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            <div>
              <p className="font-bold text-gray-900 text-lg">Review submitted!</p>
              <p className="text-sm text-gray-400 mt-1">
                Thank you for sharing your experience with {selectedProduct?.name}.
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* Product selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Product <span className="text-red-400">*</span>
              </label>
              {selectedProduct ? (
                <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-indigo-700">{selectedProduct.name}</span>
                  {!prefilledProduct && (
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <ProductSearch onSelect={p => setSelectedProduct({ id: p.id, name: p.name })} />
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Your name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="e.g. Rahul S."
                maxLength={100}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
              />
            </div>

            {/* Star rating */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Rating <span className="text-red-400">*</span>
              </label>
              <StarPicker value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Review title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarise your experience"
                maxLength={200}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Your review <span className="text-red-400">*</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Share what you liked or disliked, and how you use the product…"
                rows={5}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 resize-none"
              />
              <p className={`text-[11px] mt-1 ${body.length < 10 && body.length > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {body.length < 10 ? `${10 - body.length} more characters needed` : `${body.length} characters`}
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="flex-1 bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
