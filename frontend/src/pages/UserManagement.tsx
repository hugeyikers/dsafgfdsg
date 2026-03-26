import React, { useEffect, useState } from 'react';
import { useUserStore, User } from '../store/useUserStore';
import { useKanbanStore } from '../store/useKanbanStore';
import { Trash2, UserCog, UserPlus, X, Save, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const UserManagement = () => {
  const { users, fetchUsers, createUser, updateUserRole, updateUserPassword, deleteUser, isLoading, error } = useUserStore();
  const { columns, fetchBoard } = useKanbanStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [newUser, setNewUser] = useState({ fullName: '', email: '', password: '', role: 'USER' as const });

  useEffect(() => {
    fetchUsers();
    fetchBoard();
  }, [fetchUsers, fetchBoard]);

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

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPassword) return;
    
    if (!window.confirm(`Are you sure you want to change the password for user ${selectedUserForPassword.fullName}? This action is irreversible.`)) {
      return;
    }

    try {
      await updateUserPassword(selectedUserForPassword.id, newPassword);
      setIsPasswordModalOpen(false);
      setNewPassword('');
      alert('Password changed successfully.');
    } catch (err) {
      console.error(err);
      alert('An error occurred while changing the password.');
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 p-8 overflow-y-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Add, remove, and edit user permissions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-purple-200"
        >
          <UserPlus size={20} />
          New User
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
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Tasks</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              // POPRAWIONE DYNAMICZNE LICZENIE ZADAŃ Z FRONTENDU
              const taskCount = columns.flatMap(c => c.items).filter(i => i.assignedToId === user.id).length;
              const isOverLimit = taskCount >= 5;

              return (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-400">#{user.id}</td>
                <td className="px-6 py-4 font-bold text-gray-800">{user.fullName}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border 
                        ${isOverLimit ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    >
                        {taskCount} / 5
                    </span>
                </td>
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
                      title="Change password"
                    >
                      <Key size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
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

      {/* Password Change Modal */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Key className="text-yellow-500" size={24} />
                Change Password
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
                    <span className="font-bold block mb-1">Warning!</span>
                    You are changing the password for user <span className="font-bold">{selectedUserForPassword.fullName}</span> ({selectedUserForPassword.email}). The user will be logged out of all sessions.
                </div>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 6 characters.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 shadow-md shadow-yellow-200"
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Add User</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  placeholder="John Doe"
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
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'ADMINISTRATOR' | 'USER'})}
                >
                  <option value="USER">User</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add User'}
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