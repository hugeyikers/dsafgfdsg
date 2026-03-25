<<<<<<< HEAD
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Menu, X, LayoutDashboard, Settings } from 'lucide-react';
=======
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut } from 'lucide-react';
>>>>>>> 3fbcbef (adding working drag and drop)

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
<<<<<<< HEAD
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      
      {isSidebarOpen && (
         <div className="fixed inset-0 bg-black/20 z-[70] transition-opacity cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside 
         style={{ width: '320px' }} 
         className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 flex flex-col z-[80] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
         <div 
            style={{ paddingLeft: '20px', paddingRight: '20px' }} 
            className="h-16 flex items-center justify-between border-b border-gray-200 flex-shrink-0"
         >
            <span className="font-black text-xl tracking-widest text-purple-600">KANBAN</span>
            <button className="p-3 text-gray-300 hover:text-gray-400 transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={35}/>
            </button>
         </div>
         
         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <button 
               style={{ padding: '12px 20px' }}
               onClick={() => { navigate('/kanban'); setIsSidebarOpen(false); }}
               className={`w-full flex items-center gap-3 font-bold transition-colors ${isKanban ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
            >
               <LayoutDashboard size={30} /> Kanban Board
            </button>

            {user.role === 'ADMINISTRATOR' && (
                <button 
                   style={{ padding: '12px 20px' }}
                   onClick={() => { navigate('/users'); setIsSidebarOpen(false); }}
                   className={`w-full flex items-center gap-3 font-bold transition-colors ${!isKanban ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                >
                   <Settings size={30} /> Settings
                </button>
            )}
         </nav>

         <div className="p-9 border-gray-200 flex items-stretch flex-shrink-0 bg-white">
             <div className="flex-1 flex items-center gap-3 bg-gray-50 p-2 border border-gray-100 overflow-hidden">
                 <div className="w-20 h-20 bg-purple-100 flex flex-shrink-0 items-center justify-center text-purple-700 font-bold text-lg shadow-sm">
                   {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                 </div>
                 <div className="border-gray-200 flex flex-col text-sm overflow-hidden">
                     <span className="font-bold text-gray-800 truncate">{user.fullName}</span>
                     <span className="text-xs text-gray-500 font-medium truncate">{user.role}</span>
                 </div>
             </div>
             
             <button 
                 onClick={handleLogout}
                 className="border-gray-200 flex-shrink-0 flex items-center justify-center w-20 font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100"
                 title="Logout"
             >
                 <LogOut size={20} />
             </button>
         </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-0">
         <header 
            style={{ paddingLeft: '15px', paddingRight: '15px' }} 
            className="h-20 flex items-center bg-white border-b border-gray-200 flex-shrink-0"
         >
             <div className="flex items-center justify-between w-full h-full gap-6">
                 <div className="flex items-center gap-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-10 h-10 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-purple-600 rounded-xl transition-all shadow-sm">
                        <Menu size={22} />
                    </button>
                    <h1 className="font-bold text-lg text-gray-800 whitespace-nowrap">
                        {isKanban ? 'Kanban Board' : 'Settings'}
                    </h1>
                 </div>
                 
                 {/* Kontener na portal - rozciągnięty do prawej */}
                 <div id="kanban-header-actions" className="flex items-center justify-end h-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"></div>
             </div>
         </header>
         
         <main className="flex-1 overflow-hidden relative">
            <Outlet />
         </main>
      </div>
=======
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
>>>>>>> 3fbcbef (adding working drag and drop)
    </div>
  );
};

export default DashboardLayout;