import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  AdminApiError,
  type AdminProduct,
  type ProductCreate,
} from '../../api/admin'

const CATEGORIES = ['Phones', 'Laptops', 'Headphones', 'Smartwatches', 'Cameras', 'Tablets']
const PAGE_SIZE = 20

const EMPTY_FORM: ProductCreate = {
  name: '', brand: '', category: 'Phones', price: 0,
  rating: 4.0, review_count: 0, icon: '📱', quote: '',
  aspects: {}, pros: [], cons: [], highlights: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [offset, setOffset] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminProduct | null>(null)
  const [form, setForm] = useState<ProductCreate>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const navigate = useNavigate()
  const searchRef = useRef<ReturnType<typeof setTimeout>>()

  async function load(s = search, cat = filterCategory, off = offset) {
    setLoading(true)
    try {
      const data = await fetchAdminProducts({ search: s || undefined, category: cat || undefined, limit: PAGE_SIZE, offset: off })
      setProducts(data)
    } catch (err) {
      if (err instanceof AdminApiError && err.status === 401) navigate('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleSearchChange(val: string) {
    setSearch(val)
    clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => { setOffset(0); load(val, filterCategory, 0) }, 350)
  }

  function handleCategoryFilter(cat: string) {
    setFilterCategory(cat)
    setOffset(0)
    load(search, cat, 0)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(p: AdminProduct) {
    setEditing(p)
    setForm({
      name: p.name, brand: p.brand, category: p.category, price: p.price,
      rating: p.rating, review_count: p.review_count, icon: p.icon, quote: p.quote,
      aspects: p.aspects, pros: p.pros, cons: p.cons, highlights: p.highlights,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateProduct(editing.id, form)
        setProducts(prev => prev.map(p => p.id === updated.id ? updated : p))
      } else {
        const created = await createProduct(form)
        setProducts(prev => [created, ...prev])
      }
      setModalOpen(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProduct(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the product catalogue</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => handleCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rating</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reviews</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">${p.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-gray-900">{p.rating}</span>
                    <span className="text-gray-400 ml-0.5">★</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">{p.review_count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && products.length === PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <button
              disabled={offset === 0}
              onClick={() => { const o = Math.max(0, offset - PAGE_SIZE); setOffset(o); load(search, filterCategory, o) }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-gray-400">Showing {offset + 1}–{offset + products.length}</span>
            <button
              onClick={() => { const o = offset + PAGE_SIZE; setOffset(o); load(search, filterCategory, o) }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Name" span={2}>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Brand">
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Price ($)">
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className={inputCls} />
                </Field>
                <Field label="Rating (0–5)">
                  <input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))} className={inputCls} />
                </Field>
                <Field label="Icon (emoji)">
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className={inputCls} />
                </Field>
                <Field label="Review Count">
                  <input type="number" value={form.review_count} onChange={e => setForm(f => ({ ...f, review_count: Number(e.target.value) }))} className={inputCls} />
                </Field>
              </div>
              <Field label="Quote">
                <textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} rows={2} className={inputCls + ' resize-none'} />
              </Field>
              <Field label="Pros (one per line)">
                <textarea
                  value={form.pros.join('\n')}
                  onChange={e => setForm(f => ({ ...f, pros: e.target.value.split('\n').filter(Boolean) }))}
                  rows={3} className={inputCls + ' resize-none'}
                />
              </Field>
              <Field label="Cons (one per line)">
                <textarea
                  value={form.cons.join('\n')}
                  onChange={e => setForm(f => ({ ...f, cons: e.target.value.split('\n').filter(Boolean) }))}
                  rows={3} className={inputCls + ' resize-none'}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.brand.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Save changes' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-gray-900 mb-2">Delete product?</h2>
            <p className="text-sm text-gray-500 mb-5">This will permanently remove the product and all its reviews.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm text-gray-600 font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: number }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
