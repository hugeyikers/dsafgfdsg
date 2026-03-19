import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, LogOut, Users } from 'lucide-react';

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
    <div className="flex flex-col h-screen bg-white text-gray-800 font-sans overflow-hidden">
      
      <header className="bg-white shadow-sm border-b-2 border-gray-300 h-16 flex items-center justify-between px-6 z-10 flex-shrink-0 relative">
        
        <div className="flex-1"></div>

        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 font-bold text-xl text-black tracking-wide uppercase">
             <span>Kanban Board</span>
        </div>

        <div className="flex items-center justify-end flex-1">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm border-2 border-purple-200">
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
            <div className="w-4 h-full flex-shrink-0" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 bg-[#EBEBEB] border-r-2 border-gray-300 flex-shrink-0 flex flex-col pt-6 z-10">
          <ul className="flex flex-col gap-2 px-4 list-none m-0 p-0">
            <li>
              <Link 
                to="/kanban" 
                className={`flex items-center gap-3 px-4 py-3 transition-colors no-underline border-[3px] font-bold rounded-2xl
                  ${location.pathname.startsWith('/kanban') 
                    ? 'bg-purple-500 text-white border-purple-500 shadow-md' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                `}
              >
                <LayoutDashboard size={20} />
                <span>Tablica Kanban</span>
              </Link>
            </li>
            {user.role === 'ADMINISTRATOR' && (
              <li>
                <Link 
                  to="/users" 
                  className={`flex items-center gap-3 px-4 py-3 transition-colors no-underline border-[3px] font-bold rounded-2xl
                    ${location.pathname.startsWith('/users') 
                      ? 'bg-purple-500 text-white border-purple-500 shadow-md' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
                  `}
                >
                  <Users size={20} />
                  <span>Użytkownicy</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <main className="flex-1 overflow-hidden bg-white relative">
          <Outlet />
        </main>
      </div>

      <footer className="bg-white border-t-2 border-gray-300 py-2 px-6 text-center text-xs text-gray-400 font-medium flex-shrink-0 z-10">
        <p>© 2026 Kanban System | Simple & Efficient</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;