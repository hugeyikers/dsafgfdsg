import React, { useEffect, useState } from 'react';
import { useUserStore, User } from '../store/useUserStore';
<<<<<<< HEAD
import { useKanbanStore } from '../store/useKanbanStore';
import { Trash2, UserPlus, X, Key, Eye, EyeOff, AlertTriangle, Save } from 'lucide-react';

const UserManagement = () => {
  const { users, fetchUsers, createUser, updateUserRole, updateUserPassword, deleteUser, isLoading, error, maxTasksPerUser, setMaxTasksPerUser } = useUserStore();
  const { columns, fetchBoard } = useKanbanStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
<<<<<<< HEAD
=======
import { Trash2, UserCog, UserPlus, X, Save, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const UserManagement = () => {
  const { users, fetchUsers, createUser, updateUserRole, updateUserPassword, deleteUser, isLoading, error } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
>>>>>>> 3fbcbef (adding working drag and drop)
=======
>>>>>>> 8d94283 (update settings)
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
<<<<<<< HEAD
<<<<<<< HEAD
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'USER' as 'ADMINISTRATOR' | 'USER' });
=======
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'USER' as const });
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
>>>>>>> 3fbcbef (adding working drag and drop)
=======
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'USER' as 'ADMINISTRATOR' | 'USER' });
>>>>>>> 8d94283 (update settings)

  useEffect(() => {
    fetchUsers();
    fetchBoard();
  }, [fetchUsers, fetchBoard]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email || !newUser.password) return;
    try {
      await createUser(newUser);
      closeSidebar();
      setNewUser({ fullName: '', email: '', password: '', role: 'USER' });
    } catch (err) {
      console.error(err);
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d94283 (update settings)
  const confirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    try {
      await deleteUser(selectedUserForDelete.id);
      closeSidebar();
    } catch (err) {
      console.error(err);
<<<<<<< HEAD
=======
  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      await deleteUser(id);
>>>>>>> 3fbcbef (adding working drag and drop)
=======
>>>>>>> 8d94283 (update settings)
    }
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

  const openDeleteModal = (user: User) => {
    setSelectedUserForDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword) return;
    
<<<<<<< HEAD
<<<<<<< HEAD
=======
    // Dodatkowe, proste potwierdzenie w oknie dialogowym przeglądarki
    if (!window.confirm(`Czy na pewno zmienić hasło dla użytkownika ${selectedUserForPassword.fullName}? Ta operacja jest nieodwracalna.`)) {
      return;
    }

>>>>>>> 3fbcbef (adding working drag and drop)
=======
>>>>>>> 8d94283 (update settings)
    try {
      await updateUserPassword(selectedUserForPassword.id, newPassword);
      closeSidebar();
      setNewPassword('');
    } catch (err) {
      console.error(err);
    }
  };

  const closeSidebar = () => {
    setIsModalOpen(false);
    setIsPasswordModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUserForPassword(null);
    setSelectedUserForDelete(null);
  };

  const isAnySidebarOpen = isModalOpen || isPasswordModalOpen || isDeleteModalOpen;

  return (
    <div className="flex h-full flex-col bg-gray-50 p-8 overflow-y-auto relative">
      <style>{`
        @keyframes slideFromLeft {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .slide-from-left-animation {
          animation: slideFromLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .fade-in-animation {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 border border-red-200">
          {error}
        </div>
      )}

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d94283 (update settings)
      <div className="rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        
        <div className="px-6 pt-6 flex flex-col lg:flex-row items-start lg:items-center" style={{ paddingBottom: '10px' }}>
            <div className="w-full lg:w-1/3" style={{ paddingLeft: '5px' }}>
                <h2 className="text-lg font-bold text-gray-800">User Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Set a global task limit for all users on the board and add users.</p>
            </div>
            <div className="w-full lg:w-2/3 flex flex-wrap items-center justify-end gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider" style={{ marginLeft: '4px' }}>
                        Max Tasks Per User
                    </span>
                    <input 
                        type="number" min="1" max="99"
                        value={maxTasksPerUser}
                        onChange={(e) => setMaxTasksPerUser(parseInt(e.target.value) || 1)}
                        className="w-16 text-center text-sm font-bold py-1.5 border border-gray-300 rounded-2xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all bg-white"
                    />
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-purple-200"
                  style={{ paddingLeft: '20px', paddingRight: '28px' }}
                >
                  <UserPlus size={20} />
                  Add User
                </button>
                <div style={{ width: '10px' }} className="flex-shrink-0"></div>
            </div>
        </div>

        <div className="px-2 pb-4">
          <table className="w-full text-left text-sm text-gray-600" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead className="text-xs uppercase text-gray-500 font-bold">
<<<<<<< HEAD
=======
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
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider
                      ${user.role === 'ADMINISTRATOR' 
                        ? 'border-purple-200 bg-purple-50 text-purple-700' 
                        : 'border-blue-200 bg-blue-50 text-blue-700'}
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
                      onClick={() => handleDeleteUser(user.id)}
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
>>>>>>> 3fbcbef (adding working drag and drop)
=======
>>>>>>> 8d94283 (update settings)
              <tr>
                <th className="bg-gray-100 px-6 py-4 rounded-tl-2xl">Full Name</th>
                <th className="bg-gray-100 px-6 py-4">Email</th>
                <th className="bg-gray-100 px-6 py-4">Tasks</th>
                <th className="bg-gray-100 px-6 py-4">Role</th>
                <th className="bg-gray-100 px-6 py-4 text-right">Actions</th>
                <th className="bg-gray-100 w-[10px] px-0 py-4 rounded-tr-2xl"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === user.id).length;
                const isOverLimit = taskCount >= maxTasksPerUser;

                return (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{user.fullName}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                          ${isOverLimit ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                      >
                          {taskCount} / {maxTasksPerUser}
                      </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value as 'ADMINISTRATOR' | 'USER')}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none
                        ${user.role === 'ADMINISTRATOR' 
                          ? 'border-purple-200 bg-purple-50 text-purple-700' 
                          : 'border-blue-200 bg-blue-50 text-blue-700'}
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
                        title="Change password"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="w-[10px] px-0 py-4"></td>
                </tr>
              )})}
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 italic">
                    No users to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d94283 (update settings)
      {isAnySidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 fade-in-animation"
          onClick={closeSidebar}
        />
<<<<<<< HEAD
      )}

      {isAnySidebarOpen && (
        <aside className="fixed top-0 left-0 h-full w-full sm:w-[420px] bg-white shadow-[20px_0_60px_rgba(0,0,0,0.15)] z-50 flex flex-col slide-from-left-animation">
          <div className="flex items-center justify-between border-b border-gray-100 flex-shrink-0" style={{ padding: '30px 40px' }}>
            <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase flex items-center gap-2">
              {isModalOpen && 'Add User'}
              {isPasswordModalOpen && 'Change Password'}
              {isDeleteModalOpen && 'Delete User'}
            </h2>
            <button 
              onClick={closeSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl"
            >
              <X size={24} />
            </button>
          </div>
=======
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
>>>>>>> 3fbcbef (adding working drag and drop)

          <div className="flex-1 overflow-y-auto w-full">
            <div style={{ padding: '40px' }}>
              
              {isModalOpen && (
                <form id="addUserForm" onSubmit={handleCreateUser} className="flex flex-col gap-6 w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                    <select
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all cursor-pointer"
                      style={{ padding: '16px 24px' }}
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as 'ADMINISTRATOR' | 'USER'})}
                    >
                      <option value="USER">User</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>
                </form>
              )}

              {isPasswordModalOpen && selectedUserForPassword && (
                <form id="changePasswordForm" onSubmit={handlePasswordChange} className="flex flex-col gap-8 w-full">
                  <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-100 flex gap-4 text-yellow-800 text-base">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                    <div>
                      <span className="font-black block mb-2 text-lg">Warning!</span>
                      Changing password for <span className="font-bold">{selectedUserForPassword.fullName}</span>. They will be logged out of all active sessions.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-yellow-500 transition-all"
                        style={{ padding: '16px 48px 16px 24px' }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Minimum 6 characters.</p>
                  </div>
                </form>
              )}

              {isDeleteModalOpen && selectedUserForDelete && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 flex gap-4 text-red-800 text-base">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                    <div>
                      <span className="font-black block mb-2 text-lg">Danger Zone!</span>
                      Are you sure you want to permanently delete <span className="font-bold">{selectedUserForDelete.fullName}</span>? This action is irreversible.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="flex h-20 w-full mt-auto flex-shrink-0">
            {isDeleteModalOpen ? (
              <>
                <button
                  onClick={confirmDeleteUser}
                  className="w-1/4 h-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors outline-none cursor-pointer rounded-none"
                  title="Delete User"
                  disabled={isLoading}
                >
                  <Trash2 size={24} />
                </button>
                <button
                  onClick={closeSidebar}
                  className="w-3/4 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="w-1/4 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors outline-none cursor-pointer rounded-none"
                >
                  <X size={24} />
                </button>

                {isModalOpen && (
                  <button
                    type="submit"
                    form="addUserForm"
                    className="w-3/4 h-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
                    disabled={isLoading}
                  >
                    <Save size={18} /> Add User
                  </button>
                )}

                {isPasswordModalOpen && (
                  <button
                    type="submit"
                    form="changePasswordForm"
                    className="w-3/4 h-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
                    disabled={isLoading}
                  >
                    <Save size={18} /> Save Password
                  </button>
                )}
              </>
            )}
          </div>
<<<<<<< HEAD
        </aside>
=======
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
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
=======
      )}

      {isAnySidebarOpen && (
        <aside className="fixed top-0 left-0 h-full w-full sm:w-[420px] bg-white shadow-[20px_0_60px_rgba(0,0,0,0.15)] z-50 flex flex-col slide-from-left-animation">
          <div className="flex items-center justify-between border-b border-gray-100 flex-shrink-0" style={{ padding: '30px 40px' }}>
            <h2 className="text-xl font-black tracking-tight text-gray-800 uppercase flex items-center gap-2">
              {isModalOpen && 'Add User'}
              {isPasswordModalOpen && 'Change Password'}
              {isDeleteModalOpen && 'Delete User'}
            </h2>
            <button 
              onClick={closeSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            <div style={{ padding: '40px' }}>
              
              {isModalOpen && (
                <form id="addUserForm" onSubmit={handleCreateUser} className="flex flex-col gap-6 w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Role</label>
                    <select
                      className="w-full bg-white border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-purple-500 transition-all cursor-pointer"
                      style={{ padding: '16px 24px' }}
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as 'ADMINISTRATOR' | 'USER'})}
                    >
                      <option value="USER">User</option>
                      <option value="ADMINISTRATOR">Administrator</option>
                    </select>
                  </div>
                </form>
              )}

              {isPasswordModalOpen && selectedUserForPassword && (
                <form id="changePasswordForm" onSubmit={handlePasswordChange} className="flex flex-col gap-8 w-full">
                  <div className="p-6 bg-yellow-50 rounded-2xl border-2 border-yellow-100 flex gap-4 text-yellow-800 text-base">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                    <div>
                      <span className="font-black block mb-2 text-lg">Warning!</span>
                      Changing password for <span className="font-bold">{selectedUserForPassword.fullName}</span>. They will be logged out of all active sessions.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-800 outline-none focus:border-yellow-500 transition-all"
                        style={{ padding: '16px 48px 16px 24px' }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Minimum 6 characters.</p>
                  </div>
                </form>
              )}

              {isDeleteModalOpen && selectedUserForDelete && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-100 flex gap-4 text-red-800 text-base">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                    <div>
                      <span className="font-black block mb-2 text-lg">Danger Zone!</span>
                      Are you sure you want to permanently delete <span className="font-bold">{selectedUserForDelete.fullName}</span>? This action is irreversible.
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          <div className="flex h-20 w-full mt-auto flex-shrink-0">
            {isDeleteModalOpen ? (
              <>
                <button
                  onClick={confirmDeleteUser}
                  className="w-1/4 h-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors outline-none cursor-pointer rounded-none"
                  title="Delete User"
                  disabled={isLoading}
                >
                  <Trash2 size={24} />
                </button>
                <button
                  onClick={closeSidebar}
                  className="w-3/4 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
>>>>>>> 8d94283 (update settings)
                >
                  Anuluj
                </button>
              </>
            ) : (
              <>
                <button
<<<<<<< HEAD
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Dodawanie...' : 'Dodaj Użytkownika'}
=======
                  type="button"
                  onClick={closeSidebar}
                  className="w-1/4 h-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors outline-none cursor-pointer rounded-none"
                >
                  <X size={24} />
>>>>>>> 8d94283 (update settings)
                </button>

                {isModalOpen && (
                  <button
                    type="submit"
                    form="addUserForm"
                    className="w-3/4 h-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
                    disabled={isLoading}
                  >
                    <Save size={18} /> Add User
                  </button>
                )}

                {isPasswordModalOpen && (
                  <button
                    type="submit"
                    form="changePasswordForm"
                    className="w-3/4 h-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
                    disabled={isLoading}
                  >
                    <Save size={18} /> Save Password
                  </button>
                )}
              </>
            )}
          </div>
<<<<<<< HEAD
        </div>
>>>>>>> 3fbcbef (adding working drag and drop)
=======
        </aside>
>>>>>>> 8d94283 (update settings)
      )}
    </div>
  );
};

export default UserManagement;