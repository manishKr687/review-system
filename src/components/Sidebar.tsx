import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, Star, LayoutGrid, GitCompare, MessageSquare,
  FileEdit, Heart, Clock, PenLine, Settings, X,
} from 'lucide-react';
import WriteReviewModal from './WriteReviewModal';

const navItems = [
  { icon: Home,          label: 'Home',        path: '/'               },
  { icon: Star,          label: 'Top Rated',   path: '/top-rated'      },
  { icon: LayoutGrid,    label: 'Categories',  path: '/categories'     },
  { icon: GitCompare,    label: 'Compare',     path: '/compare'        },
  { icon: MessageSquare, label: 'Review Feed', path: '/search'         },
  { icon: FileEdit,      label: 'My Reviews',  path: '/my-reviews'     },
  { icon: Heart,         label: 'Watchlist',   path: '/watchlist'      },
];

const activityItems = [
  { icon: Clock, label: 'Recently Viewed', path: '/recently-viewed' },
];

type NavItemProps = { icon: React.ElementType; label: string; path: string; exact?: boolean };

function SidebarLink({ icon: Icon, label, path, exact = false }: NavItemProps) {
  return (
    <NavLink
      to={path}
      end={exact || path === '/'}
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
  );
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-white border-r border-gray-100 flex flex-col h-screen flex-shrink-0
        transform transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">ReviewLens</p>
            <p className="text-[11px] text-gray-400 leading-tight">Real reviews. Smart choices.</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarLink key={item.label} {...item} />
        ))}

        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mt-5 mb-2">
          My Activity
        </p>
        {activityItems.map((item) => (
          <SidebarLink key={item.label} {...item} />
        ))}
      </nav>

      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mt-5 mb-2">
        Admin
      </p>
      <SidebarLink icon={Settings} label="Admin Panel" path="/admin" />

      {/* Share card */}
      <div className="p-3">
        <div className="bg-indigo-600 rounded-xl p-4 text-white">
          <p className="font-semibold text-sm">Share your experience</p>
          <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed">
            Your review helps others make better choices.
          </p>
          <div className="flex justify-center my-3">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-3xl">
              ✍️
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-white text-indigo-600 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            Write a Review
          </button>
        </div>
      </div>

    </aside>

    {showModal && <WriteReviewModal onClose={() => setShowModal(false)} />}
  </>
  );
}
