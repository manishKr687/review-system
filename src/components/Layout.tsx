import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Shared shell for all pages — Sidebar + Header + routed page content via <Outlet>
export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
