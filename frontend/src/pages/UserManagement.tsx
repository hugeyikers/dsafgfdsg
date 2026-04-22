import React, { useEffect, useState } from 'react';
import { useUserStore, User } from '../store/useUserStore';
import { useKanbanStore } from '../store/useKanbanStore';
import { Trash2, UserPlus, X, Key, Eye, EyeOff, AlertTriangle, Save } from 'lucide-react';

const UserManagement = () => {
  const { users, fetchUsers, createUser, updateUserRole, updateUserPassword, deleteUser, isLoading, error, maxTasksPerUser, setMaxTasksPerUser } = useUserStore();
  const { columns, fetchBoard } = useKanbanStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'USER' as 'ADMINISTRATOR' | 'USER' });

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

  const confirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    try {
      await deleteUser(selectedUserForDelete.id);
      closeSidebar();
    } catch (err) {
      console.error(err);
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
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900 p-8 overflow-y-auto relative transition-colors duration-300">
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
        <div className="mb-6 rounded-lg bg-red-100 dark:bg-red-900/30 p-4 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        
        <div className="px-6 pt-6 flex flex-col lg:flex-row items-start lg:items-center" style={{ padding: 10 }}>
            <div className="w-full lg:w-1/3" style={{ paddingLeft: '5px' }}>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">User Settings</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set a global task limit for all users on the board and add users.</p>
            </div>
            <div className="w-full lg:w-2/3 flex flex-wrap items-center justify-end gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl transition-colors duration-300">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider" style={{ paddingTop: "10px", paddingBottom:"10px", marginLeft:"10px"}}>
                        Max Tasks Per User
                    </span>
                    <input 
                        style={{
                          paddingTop: "5px", paddingBottom:"px"
                        }}
                        type="number" min="1" max="99"
                        value={maxTasksPerUser}
                        onChange={(e) => setMaxTasksPerUser(parseInt(e.target.value) || 1)}
                        className="w-16 text-center text-sm font-bold py-1.5 border border-gray-300 dark:border-gray-600 rounded-2xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/50 transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    />
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-purple-600 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-purple-200 dark:hover:shadow-purple-900/30"
                  style={{ paddingLeft: '20px', paddingRight: '28px', paddingTop: "5px", paddingBottom:"5px"}}
                >
                  <UserPlus size={20} />
                  Add User
                </button>
                <div style={{ width: '10px' }} className="flex-shrink-0"></div>
            </div>
        </div>

        <div className="px-2 pb-4"
        style={{
          padding:10
        }}>
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
              <tr>
                <th style={{padding:10}} className="bg-gray-100 dark:bg-gray-700/50 px-6 py-4 rounded-tl-2xl transition-colors duration-300">Full Name</th>
                <th style={{padding:10}} className="bg-gray-100 dark:bg-gray-700/50 px-6 py-4 transition-colors duration-300">Email</th>
                <th style={{padding:10}} className="bg-gray-100 dark:bg-gray-700/50 px-6 py-4 transition-colors duration-300">Tasks</th>
                <th style={{padding:10}} className="bg-gray-100 dark:bg-gray-700/50 px-6 py-4 transition-colors duration-300">Role</th>
                <th style={{padding:10}} className="bg-gray-100 dark:bg-gray-700/50 px-6 py-4 text-right transition-colors duration-300">Actions</th>
                <th style={{padding:10}} className="bg-gray-100 dark:bg-gray-700/50 w-[10px] px-0 py-4 rounded-tr-2xl transition-colors duration-300"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {users.map((user) => {
                const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedUsers.some((u: any) => u.id === user.id)).length;
                const isOverLimit = taskCount >= maxTasksPerUser;

                return (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td style={{padding:10}} className="px-6 py-4 font-bold text-gray-800 dark:text-gray-100">{user.fullName}</td>
                  <td style={{padding:10}} className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td style={{padding:10}} className="px-6 py-4">
                      <span style={{paddingRight:5, paddingLeft:5, paddingTop:3, paddingBottom:3}} className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                          ${isOverLimit ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'}`}
                      >
                          {taskCount} / {maxTasksPerUser}
                      </span>
                  </td>
                  <td className="px-6 py-4"
                  style={{paddingRight:5, paddingLeft:5, paddingTop:3, paddingBottom:3}}>
                    <select
                    style={{paddingRight:5, paddingLeft:5, paddingTop:3, paddingBottom:3, width:"150px"}}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user, e.target.value as 'ADMINISTRATOR' | 'USER')}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none transition-colors
                        ${user.role === 'ADMINISTRATOR' 
                          ? 'border-purple-200 dark:border-purple-800/50 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' 
                          : 'border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}
                      `}
                    >
                      <option value="USER" className="dark:bg-gray-800 dark:text-gray-100">User</option>
                      <option value="ADMINISTRATOR" className="dark:bg-gray-800 dark:text-gray-100">Administrator</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPasswordModal(user)}
                        className="rounded-lg p-2 text-gray-400 dark:text-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                        title="Change password"
                      >
                        <Key size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="rounded-lg p-2 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400 dark:text-gray-500 italic">
                    No users to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAnySidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 fade-in-animation"
          onClick={closeSidebar}
        />
      )}

      {isAnySidebarOpen && (
        <aside className="fixed top-0 left-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-800 shadow-[20px_0_60px_rgba(0,0,0,0.15)] dark:shadow-gray-900/50 z-50 flex flex-col slide-from-left-animation transition-colors duration-300">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 flex-shrink-0" style={{ padding: '30px 40px' }}>
            <h2 className="text-xl font-black tracking-tight text-gray-800 dark:text-gray-100 uppercase flex items-center gap-2">
              {isModalOpen && 'Add User'}
              {isPasswordModalOpen && 'Change Password'}
              {isDeleteModalOpen && 'Delete User'}
            </h2>
            <button 
              onClick={closeSidebar}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-xl"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full">
            <div style={{ padding: '40px' }}>
              
              {isModalOpen && (
                <form id="addUserForm" onSubmit={handleCreateUser} className="flex flex-col gap-6 w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-purple-500 transition-all"
                      style={{ padding: '16px 24px' }}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Role</label>
                    <select
                      className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-purple-500 transition-all cursor-pointer"
                      style={{ padding: '16px 24px' }}
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as 'ADMINISTRATOR' | 'USER'})}
                    >
                      <option value="USER" className="dark:bg-gray-800 dark:text-gray-100">User</option>
                      <option value="ADMINISTRATOR" className="dark:bg-gray-800 dark:text-gray-100">Administrator</option>
                    </select>
                  </div>
                </form>
              )}

              {isPasswordModalOpen && selectedUserForPassword && (
                <form id="changePasswordForm" onSubmit={handlePasswordChange} className="flex flex-col gap-8 w-full">
                  <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-yellow-100 dark:border-yellow-800/50 flex gap-4 text-yellow-800 dark:text-yellow-400 text-base">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={28} />
                    <div>
                      <span className="font-black block mb-2 text-lg">Warning!</span>
                      Changing password for <span className="font-bold">{selectedUserForPassword.fullName}</span>. They will be logged out of all active sessions.
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full mt-2">
                    <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative w-full">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-yellow-500 transition-all"
                        style={{ padding: '16px 48px 16px 24px' }}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="mt-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Minimum 6 characters.</p>
                  </div>
                </form>
              )}

              {isDeleteModalOpen && selectedUserForDelete && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-100 dark:border-red-800/50 flex gap-4 text-red-800 dark:text-red-400 text-base">
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
                  className="w-3/4 h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-black uppercase tracking-widest text-xs transition-colors outline-none cursor-pointer rounded-none"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={closeSidebar}
                  className="w-1/4 h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors outline-none cursor-pointer rounded-none"
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
        </aside>
      )}
    </div>
  );
};

export default UserManagement;