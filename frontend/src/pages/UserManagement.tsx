import React, { useEffect, useState } from 'react';
import { useUserStore, User } from '../store/useUserStore';
import { useKanbanStore } from '../store/useKanbanStore';
import { Trash2, UserCog, UserPlus, X, Save, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// --- KOMPONENT MODALA DO USUWANIA UŻYTKOWNIKA ---
const DeleteUserModal = ({ userToDelete, onClose }: { userToDelete: User, onClose: () => void }) => {
    const { handleUserDeletionTasks } = useKanbanStore();
    const { deleteUser, users } = useUserStore();
    const [action, setAction] = useState<'reassign' | 'unassign' | 'delete'>('unassign');
    const [targetUserId, setTargetUserId] = useState<number | ''>('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Lista użytkowników bez tego, którego właśnie usuwamy
    const availableUsers = users.filter(u => u.id !== userToDelete.id);

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            // 1. Zrób porządek z taskami za pomocą metody w useKanbanStore
            if (handleUserDeletionTasks) {
               await handleUserDeletionTasks(userToDelete.id, action, targetUserId === '' ? null : Number(targetUserId));
            }
            // 2. Trwale usuń usera
            await deleteUser(userToDelete.id);
            onClose();
        } catch (error) {
            console.error("Błąd podczas usuwania użytkownika:", error);
            alert("Wystąpił błąd podczas usuwania użytkownika i jego zadań.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-[400px] max-w-full animate-in fade-in zoom-in duration-200 border-t-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Trash2 className="text-red-500" size={24} />
                        Usuwanie konta
                    </h3>
                    <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                    Usuwasz użytkownika: <span className="font-bold text-gray-800">{userToDelete.fullName}</span>.
                </p>
                <p className="text-sm text-gray-600 mb-6">Co zrobić z przypisanymi do niego zadaniami?</p>
                
                <div className="flex flex-col gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                        <input type="radio" name="action" checked={action === 'unassign'} onChange={() => setAction('unassign')} className="w-4 h-4 text-purple-600 accent-purple-600" />
                        <span className="group-hover:text-purple-700 transition-colors">Przenieś do "Nieprzypisane"</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm cursor-pointer group">
                        <input type="radio" name="action" checked={action === 'delete'} onChange={() => setAction('delete')} className="w-4 h-4 text-red-600 accent-red-600" />
                        <span className="text-red-600 font-medium group-hover:text-red-700 transition-colors">Usuń bezpowrotnie zadania</span>
                    </label>
                    <label className="flex flex-col gap-3 text-sm cursor-pointer">
                        <div className="flex items-center gap-3 group">
                            <input type="radio" name="action" checked={action === 'reassign'} onChange={() => setAction('reassign')} className="w-4 h-4 text-purple-600 accent-purple-600" />
                            <span className="group-hover:text-purple-700 transition-colors">Przypisz do innej osoby</span>
                        </div>
                        {action === 'reassign' && (
                            <select 
                                value={targetUserId} 
                                onChange={e => setTargetUserId(e.target.value as any)}
                                className="ml-7 p-2.5 border border-purple-200 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 bg-white"
                            >
                                <option value="" disabled>-- Wybierz nowego wykonawcę --</option>
                                {availableUsers.map(u => (
                                    <option key={u.id} value={u.id}>{u.fullName}</option>
                                ))}
                            </select>
                        )}
                    </label>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                        Anuluj
                    </button>
                    <button 
                        disabled={isDeleting || (action === 'reassign' && targetUserId === '')} 
                        onClick={confirmDelete} 
                        className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {isDeleting ? 'Usuwanie...' : 'Potwierdź usunięcie'}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- GŁÓWNY KOMPONENT USER MANAGEMENT ---
const UserManagement = () => {
  const { users, fetchUsers, createUser, updateUserRole, updateUserPassword, isLoading, error } = useUserStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Stan do modala usuwania użytkownika
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'USER' as const });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email || !newUser.password) return;
    try {
      await createUser(newUser);
      setIsModalOpen(false);
      setNewUser({ fullName: '', email: '', password: '', role: 'USER' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUserClick = (user: User) => {
    // Zamiast window.confirm ustawiamy usera do usunięcia, co wywoła nasz nowy Modal
    setUserToDelete(user);
  };

  const handleRoleChange = async (user: User, newRole: 'ADMINISTRATOR' | 'USER') => {
    if (user.role !== newRole) {
       await updateUserRole(user.id, newRole);
    }
  };

  const openPasswordModal = (user: User) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
    setShowPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword) return;
    
    if (!window.confirm(`Czy na pewno zmienić hasło dla użytkownika ${selectedUserForPassword.fullName}? Ta operacja jest nieodwracalna.`)) {
      return;
    }

    try {
      await updateUserPassword(selectedUserForPassword.id, newPassword);
      setIsPasswordModalOpen(false);
      setNewPassword('');
      alert('Hasło zostało zmienione pomyślnie.');
    } catch (err) {
      console.error(err);
      alert('Wystąpił błąd podczas zmiany hasła.');
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 p-8 overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Zarządzanie Użytkownikami</h1>
          <p className="text-gray-500 mt-1">Dodawaj, usuwaj i edytuj uprawnienia użytkowników.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-purple-200"
        >
          <UserPlus size={20} />
          Nowy Użytkownik
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-100 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Imię i Nazwisko</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rola</th>
              <th className="px-6 py-4 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-400">#{user.id}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{user.fullName}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as 'ADMINISTRATOR' | 'USER')}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider outline-none cursor-pointer
                      ${user.role === 'ADMINISTRATOR' 
                        ? 'border-purple-200 bg-purple-50 text-purple-700 focus:ring-purple-500' 
                        : 'border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500'}
                    `}
                  >
                    <option value="USER">User</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openPasswordModal(user)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                      title="Zmień hasło"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUserClick(user)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Usuń użytkownika"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                  Brak użytkowników do wyświetlenia.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Wyrenderuj Modal usuwania użytkownika, jeśli wybrano jakiegoś */}
      {userToDelete && (
          <DeleteUserModal 
             userToDelete={userToDelete} 
             onClose={() => setUserToDelete(null)} 
          />
      )}

      {/* Modal - Zmiana hasła */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Key className="text-yellow-500" size={24} />
                Zmiana hasła
              </h2>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3 text-yellow-800 text-sm">
                <AlertTriangle className="flex-shrink-0" size={20} />
                <div>
                    <span className="font-bold block mb-1">Uwaga!</span>
                    Zmieniasz hasło dla użytkownika <span className="font-bold">{selectedUserForPassword.fullName}</span> ({selectedUserForPassword.email}). Użytkownik zostanie wylogowany ze wszystkich sesji.
                </div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nowe Hasło</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Wpisz nowe hasło..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 znaków.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 shadow-md shadow-yellow-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Zmienianie...' : 'Zmień Hasło'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Dodawanie użytkownika */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Dodaj Użytkownika</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pełna Nazwa</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  placeholder="Jan Kowalski"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="jan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white cursor-pointer"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'ADMINISTRATOR' | 'USER'})}
                >
                  <option value="USER">Użytkownik</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Dodawanie...' : 'Dodaj Użytkownika'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;