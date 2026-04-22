import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import KanbanBoard from './features/kanban/KanbanBoard';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import Manual from './pages/Manual';
import About from './pages/About';

import { useAuthStore } from './store/useAuthStore';

function App() {
  const { isLogged, user } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!isLogged ? <Login /> : <Navigate to="/kanban" />} />
        
        <Route element={isLogged ? <DashboardLayout user={user!} /> : <Navigate to="/login" />}>
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/manual" element={<Manual />} />
          <Route path="/about" element={<About />} />
          
          {user?.role === 'ADMINISTRATOR' && (
             <Route path="/users" element={<UserManagement />} />
          )}
          <Route path="/" element={<Navigate to="/kanban" />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/kanban" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;