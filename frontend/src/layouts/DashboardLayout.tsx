import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Menu, X, LayoutDashboard, Users } from 'lucide-react';

interface User {
  fullName: string;
  role: string;
}

const DashboardLayout = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
      logout();
      navigate('/login', { replace: true });
  };

  const isKanban = location.pathname.startsWith('/kanban');

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      {isSidebarOpen && (
         <div className="fixed inset-0 bg-black/20 z-40 transition-opacity cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
         
         <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
            <span className="font-black text-xl tracking-widest text-purple-600">CANBAN</span>
            <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-xl transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={20}/>
            </button>
         </div>
         
         <div className="p-6 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
             <div className="w-10 h-10 rounded-full bg-purple-100 flex flex-shrink-0 items-center justify-center text-purple-700 font-bold text-lg shadow-sm">
               {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
             </div>
             <div className="flex flex-col text-sm overflow-hidden">
                 <span className="font-bold text-gray-800 truncate">{user.fullName}</span>
                 <span className="text-xs text-gray-500 font-medium truncate">{user.role}</span>
             </div>
         </div>

         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
               onClick={() => { navigate('/kanban'); setIsSidebarOpen(false); }}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${isKanban ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
            >
               <LayoutDashboard size={20} /> Kanban Board
            </button>
            {user.role === 'ADMINISTRATOR' && (
                <button 
                   onClick={() => { navigate('/users'); setIsSidebarOpen(false); }}
                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${!isKanban ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                >
                   <Users size={20} /> User Management
                </button>
            )}
         </nav>

         <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <button 
               onClick={handleLogout}
               className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
               <LogOut size={20} /> Logout
            </button>
         </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
         <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 flex-shrink-0">
             <div className="flex items-center gap-4">
                 {/* --- NOWY, ŁADNY PRZYCISK HAMBURGERA --- */}
                 <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-10 h-10 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-xl transition-all shadow-sm">
                    <Menu size={22} />
                 </button>
                 <h1 className="font-bold text-lg text-gray-800">{isKanban ? 'Kanban Board' : 'User Management'}</h1>
             </div>
         </header>
         
         <main className="flex-1 overflow-hidden relative">
            <Outlet />
         </main>
      </div>
    </div>
  );
};

export default DashboardLayout;