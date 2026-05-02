import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Star, LayoutDashboard, Package, LogOut } from 'lucide-react'
import { clearKey, getStoredKey } from '../../api/admin'
import { useEffect } from 'react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package,         label: 'Products',  path: '/admin/products' },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!getStoredKey()) navigate('/admin/login', { replace: true })
  }, [navigate])

  function handleLogout() {
    clearKey()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-screen flex-shrink-0">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">ReviewLens</p>
              <p className="text-[11px] text-amber-500 font-medium leading-tight">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-3">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/admin'}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <NavLink
            to="/"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 mb-1 transition-colors"
          >
            <Star className="w-4 h-4 text-gray-400" /> View Site
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
