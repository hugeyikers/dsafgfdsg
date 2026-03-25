// frontend/src/App.tsx
import React, { useState } from 'react';
import { LayoutDashboard, Users } from 'lucide-react';
import KanbanBoard from './features/kanban/KanbanBoard';
import UserManagement from './pages/UserManagement';

const App = () => {
  // Stan przełącznika: 'kanban' lub 'users'
  const [currentView, setCurrentView] = useState<'kanban' | 'users'>('kanban');

  const navItemClass = (isActive: boolean) => `
    flex items-center gap-2.5 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200
    ${isActive 
      ? 'bg-purple-100 text-purple-700 shadow-inner' 
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
  `;

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 overflow-hidden font-sans antialiased text-gray-800">
      
      {/* 1. GÓRNA NAWIGACJA (SWITCHER - Pastel Vibe) */}
      <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-gray-950 flex items-center gap-3">
          <span className="w-4 h-9 bg-purple-400 rounded-full block"></span>
          Projekt Zespołowy
        </h1>

        <nav className="flex items-center gap-2 p-1 bg-gray-50 border border-gray-100 rounded-full shadow-inner">
          <button 
            onClick={() => setCurrentView('kanban')}
            className={navItemClass(currentView === 'kanban')}
          >
            <LayoutDashboard size={18} />
            Tablica Kanban
          </button>
          <button 
            onClick={() => setCurrentView('users')}
            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-200
              ${currentView === 'users' 
                ? 'bg-emerald-100 text-emerald-800 shadow-inner' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <Users size={18} />
            Użytkownicy
          </button>
        </nav>

        {/* Możesz tu dodać avatar zalogowanego usera */}
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center border-2 border-white shadow-md">
          ADMIN
        </div>
      </header>

      {/* 2. GŁÓWNA TREŚĆ */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'kanban' && <KanbanBoard />}
        {currentView === 'users' && <UserManagement />}
      </main>
    </div>
  );
};

export default App;