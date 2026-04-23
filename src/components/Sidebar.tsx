import {
  Home, Star, LayoutGrid, GitCompare, MessageSquare,
  FileEdit, Heart, Bell, Clock, ThumbsUp, PenLine,
} from 'lucide-react';

const navItems = [
  { icon: Home,         label: 'Home',        active: true },
  { icon: Star,         label: 'Top Rated' },
  { icon: LayoutGrid,   label: 'Categories' },
  { icon: GitCompare,   label: 'Compare' },
  { icon: MessageSquare,label: 'Review Feed' },
  { icon: FileEdit,     label: 'My Reviews' },
  { icon: Heart,        label: 'Watchlist' },
  { icon: Bell,         label: 'Alerts' },
];

const activityItems = [
  { icon: Clock,    label: 'Recently Viewed' },
  { icon: ThumbsUp, label: 'Helpful Reviews' },
  { icon: Heart,    label: 'Liked Reviews' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-screen flex-shrink-0">

      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">ReviewLens</p>
            <p className="text-[11px] text-gray-400 leading-tight">Real reviews. Smart choices.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
              active
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
            {label}
          </button>
        ))}

        {/* My Activity section */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mt-5 mb-2">
          My Activity
        </p>
        {activityItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Icon className="w-4 h-4 flex-shrink-0 text-gray-400" />
            {label}
          </button>
        ))}
      </nav>

      {/* Share your experience card */}
      <div className="p-3">
        <div className="bg-indigo-600 rounded-xl p-4 text-white">
          <p className="font-semibold text-sm">Share your experience</p>
          <p className="text-[11px] text-indigo-200 mt-1 leading-relaxed">
            Your review helps others make better choices.
          </p>

          {/* Illustration placeholder */}
          <div className="flex justify-center my-3">
            <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-3xl">
              ✍️
            </div>
          </div>

          <button className="w-full bg-white text-indigo-600 rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
            <PenLine className="w-3.5 h-3.5" />
            Write a Review
          </button>
        </div>
      </div>

    </aside>
  );
}
