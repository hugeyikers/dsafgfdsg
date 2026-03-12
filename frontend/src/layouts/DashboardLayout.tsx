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
      
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-6 z-10 relative">
        
        <div className="flex-1 flex items-center gap-2 font-bold text-xl text-primary-700">
             
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-extrabold text-gray-800 uppercase tracking-wider">Kanban Board</h1>
        </div>

        <div className="flex-1 flex items-center justify-end gap-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                  {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-sm text-right">
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
        <main className="flex-1 overflow-hidden bg-gray-100 relative">
          <Outlet />
        </main>
      </div>

      <footer className="bg-white border-t border-gray-200 py-2 px-6 text-center text-xs text-gray-400">
        <p>© 2026 Kanban System | Simple & Efficient</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;