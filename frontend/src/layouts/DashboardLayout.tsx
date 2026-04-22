import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LogOut, Menu, X, LayoutDashboard, Settings, Moon, Sun, Eye, EyeOff, BookOpen, Info } from 'lucide-react';

interface User {
  fullName: string;
  role: string;
}

const DashboardLayout = ({ user }: { user: User }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore(state => state.logout);
  
  const { isDarkMode, isColorblindMode, toggleDarkMode, toggleColorblindMode } = useThemeStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    isColorblindMode ? root.classList.add('colorblind') : root.classList.remove('colorblind');
  }, [isDarkMode, isColorblindMode]);

  const handleLogout = () => {
      logout();
      navigate('/login', { replace: true });
  };

  const isKanban = location.pathname.startsWith('/kanban');
  const isUsers = location.pathname.startsWith('/users');
  const isManual = location.pathname.startsWith('/manual');
  const isAbout = location.pathname.startsWith('/about');

  let pageTitle = 'Kanban Board';
  if (isUsers) pageTitle = 'Settings';
  else if (isManual) pageTitle = 'User Guide';
  else if (isAbout) pageTitle = 'About the Project';

  return (
    <div className="flex h-screen bg-[var(--bg-page)] text-[var(--text-main)] font-sans overflow-hidden transition-colors duration-300">
      
      {isSidebarOpen && (
         <div className="fixed inset-0 bg-black/40 z-[70] transition-opacity cursor-pointer" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside 
         style={{ width: '320px' }} 
         className={`fixed inset-y-0 left-0 bg-[var(--bg-card)] border-r border-[var(--border-base)] flex flex-col z-[80] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
         <div 
            style={{ paddingLeft: '20px', paddingRight: '20px' }} 
            className="h-16 flex items-center justify-between border-b border-[var(--border-base)] flex-shrink-0 transition-colors duration-300"
         >
            <span className="font-black text-xl tracking-widest text-[var(--accent-primary)]">KANBAN</span>
            <button className="p-3 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors" onClick={() => setIsSidebarOpen(false)}>
                <X size={35}/>
            </button>
         </div>
         
         <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
            <button 
               style={{ padding: '12px 20px' }}
               onClick={() => { navigate('/kanban'); setIsSidebarOpen(false); }}
               className={`w-full flex items-center gap-3 font-bold rounded-lg transition-colors ${isKanban ? 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-main)]'}`}
            >
               <LayoutDashboard size={26} /> Kanban Board
            </button>

            <button 
               style={{ padding: '12px 20px' }}
               onClick={() => { navigate('/manual'); setIsSidebarOpen(false); }}
               className={`w-full flex items-center gap-3 font-bold rounded-lg transition-colors ${isManual ? 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-main)]'}`}
            >
               <BookOpen size={26} /> Manual
            </button>

            <button 
               style={{ padding: '12px 20px' }}
               onClick={() => { navigate('/about'); setIsSidebarOpen(false); }}
               className={`w-full flex items-center gap-3 font-bold rounded-lg transition-colors ${isAbout ? 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-main)]'}`}
            >
               <Info size={26} /> About
            </button>

            {user.role === 'ADMINISTRATOR' && (
                <div className="pt-4 mt-2 border-t border-[var(--border-base)]">
                    <button 
                    style={{ padding: '12px 20px' }}
                    onClick={() => { navigate('/users'); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 font-bold rounded-lg transition-colors ${isUsers ? 'bg-[var(--accent-primary-light)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--text-main)]'}`}
                    >
                    <Settings size={26} /> Settings
                    </button>
                </div>
            )}
         </nav>

         {/* --- SEKCJA PRZEŁĄCZNIKÓW MOTYWÓW --- */}
         <div className="px-6 py-5 border-t border-[var(--border-base)] space-y-4 bg-[var(--bg-page)] transition-colors duration-300">
            <div 
            style={{ padding:10 }}
            className="flex items-center justify-between cursor-pointer" onClick={toggleDarkMode}>
                <span className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2 select-none">
                    {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
                    Dark Mode
                </span>
                <button className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${isDarkMode ? 'bg-[var(--accent-primary)]' : 'bg-gray-400'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
            
            <div 
            style={{ padding:10 }}
            className="flex items-center justify-between cursor-pointer" onClick={toggleColorblindMode}>
                <span className="text-sm font-semibold text-[var(--text-muted)] flex items-center gap-2 select-none">
                    {isColorblindMode ? <Eye size={18} /> : <EyeOff size={18} />}
                    Colorblind Mode
                </span>
                <button className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none ${isColorblindMode ? 'bg-[var(--accent-primary)]' : 'bg-gray-400'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isColorblindMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
         </div>

         {/* Profil Użytkownika i Logout */}
         <div className="p-9 border-t border-[var(--border-base)] flex items-stretch flex-shrink-0 bg-[var(--bg-card)] transition-colors duration-300">
             <div className="flex-1 flex items-center gap-3 bg-[var(--bg-page)] p-2 border border-[var(--border-base)] overflow-hidden rounded-l-lg transition-colors duration-300">
                 <div className="w-20 h-20 bg-[var(--accent-primary-light)] flex flex-shrink-0 items-center justify-center text-[var(--accent-primary)] font-bold text-lg shadow-sm rounded-md transition-colors duration-300">
                   {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'U'}
                 </div>
                 <div className="flex flex-col text-sm overflow-hidden">
                     <span className="font-bold text-[var(--text-main)] truncate">{user.fullName}</span>
                     <span className="text-xs text-[var(--text-muted)] font-medium truncate">{user.role}</span>
                 </div>
             </div>
             
             <button 
                 onClick={handleLogout}
                 className="border-[var(--border-base)] flex-shrink-0 flex items-center justify-center w-20 font-bold 
                 text-[var(--text-muted)] hover:bg-[var(--status-error)]/10 hover:text-[var(--status-error)]
                 transition-colors border border-transparent hover:border-[var(--status-error)]/30 rounded-r-lg"
                 title="Logout"
             >
                 <LogOut size={20} />
             </button>
         </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-0">
         <header 
            style={{ paddingLeft: '15px', paddingRight: '15px' }} 
            className="h-20 flex items-center bg-[var(--bg-card)] border-b border-[var(--border-base)] flex-shrink-0 transition-colors duration-300"
         >
             <div className="flex items-center justify-between w-full h-full gap-6">
                 <div className="flex items-center gap-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="flex items-center justify-center w-10 h-10 border-2 border-[var(--border-base)] text-[var(--text-muted)] hover:bg-[var(--bg-page)] hover:text-[var(--accent-primary)] rounded-xl transition-all shadow-sm">
                        <Menu size={22} />
                    </button>
                    <h1 className="font-bold text-lg text-[var(--text-main)] whitespace-nowrap">
                        {pageTitle}
                    </h1>
                 </div>
                 {isKanban && <div id="kanban-header-actions" className="flex items-center justify-end h-full flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"></div>}
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