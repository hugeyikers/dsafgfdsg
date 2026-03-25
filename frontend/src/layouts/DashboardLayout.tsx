import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut } from 'lucide-react';

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

  const isKanban = location.pathname.startsWith('/kanban');

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10 flex-shrink-0 relative">
        <div className="flex-1"></div>

        {/* Central Switch (Kanban / Users) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
             <button 
                onClick={() => navigate('/kanban')}
                className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${isKanban ? 'bg-purple-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
             >
                 KANBAN
             </button>
             {user.role === 'ADMINISTRATOR' && (
                 <button 
                    onClick={() => navigate('/users')}
                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all ${!isKanban ? 'bg-purple-500 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                     USERS
                 </button>
             )}
        </div>

        <div className="flex items-center justify-end flex-1">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
                  {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-sm text-right">
                    <span className="font-bold text-gray-800">{user.fullName}</span>
                    <span className="text-xs text-gray-500 font-medium">{user.role}</span>
                </div>
                <button 
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-transform hover:scale-110"
                  onClick={handleLogout}
                  title="Wyloguj"
                >
                  <LogOut size={20} />
                </button>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;