import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, LogOut } from 'lucide-react';

interface User {
  fullName: string;
  role: string;
}

const DashboardLayout = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
      logout();
      navigate('/login', { replace: true });
    };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Topbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-2 font-bold text-xl text-primary-700">
             <span>📋 Kanban System</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-sm">
                    <span className="font-semibold text-gray-700">{user.fullName}</span>
                    <span className="text-xs text-gray-500">{user.role}</span>
                </div>
                <button 
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={handleLogout}
                  title="Wyloguj"
                >
                  <LogOut size={20} />
                </button>
            </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col pt-4">
          <ul className="flex flex-col gap-1 px-2 list-none m-0 p-0">
            <li>
              <Link 
                to="/kanban" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors no-underline
                  ${location.pathname.startsWith('/kanban') 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <LayoutDashboard size={20} />
                <span>Tablica Kanban</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-100 relative">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-2 px-6 text-center text-xs text-gray-400">
        <p>© 2026 Kanban System | Simple & Efficient</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
