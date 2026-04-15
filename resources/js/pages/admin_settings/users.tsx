import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
  Users, Search, ArrowLeft, Home, Shield, Mail,
  CheckCircle, XCircle, Edit2, UserPlus, Trash2
} from 'lucide-react';
import { UserRolesProps, SystemUser, UserRole, UserStatus } from '../types';

const UserRoles: React.FC<UserRolesProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery]     = useState('');
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser]     = useState<SystemUser | null>(null);

  const { users: initialUsers } = usePage().props as unknown as { users: SystemUser[] };
  const [users, setUsers] = useState<SystemUser[]>(initialUsers);

  // ── Add form state ──────────────────────────────────────────────────
  const [newUser, setNewUser] = useState<Partial<SystemUser>>({
    name: '', phone: '254', email: '',
    password: '', confirmPassword: '',
    role: 'Support Agent', status: 'Active'
  });

  // ── Edit form state ─────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    name: '', phone: '', email: '',
    role: '' as UserRole, status: '' as UserStatus,
    password: '', password_confirmation: ''
  });

  // ── Helpers ─────────────────────────────────────────────────────────
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin':         return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Manager':       return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Support Agent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Technician':    return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Sales':         return 'bg-green-100 text-green-700 border-green-200';
      default:              return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: UserStatus): string => {
    if (status === 'Active') return 'text-green-600 bg-green-50';
    return 'text-slate-500 bg-slate-100';
  };

  // ── Open edit modal pre-filled with user data ───────────────────────
  const handleOpenEdit = (user: SystemUser) => {
    setEditingUser(user);
    setEditForm({
      name:                  user.name,
      phone:                 user.phone || '',
      email:                 user.email,
      role:                  user.role,
      status:                user.status,
      password:              '',
      password_confirmation: ''
    });
    setShowEditModal(true);
  };

  // ── Add user ────────────────────────────────────────────────────────
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await axios.post('/api/user', {
        name:                  newUser.name,
        phone:                 newUser.phone,
        email:                 newUser.email,
        password:              newUser.password,
        password_confirmation: newUser.confirmPassword,
        role:                  newUser.role,
        status:                newUser.status
      });

      // Add to local list using the server response
      setUsers([...users, response.data.user]);
      setShowAddModal(false);
      setNewUser({ name: '', phone: '254', email: '', password: '', confirmPassword: '', role: 'Support Agent', status: 'Active' });
      alert(`${newUser.name} has been added successfully.`);

    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        alert(Object.values(errors).flat().join('\n'));
      } else {
        alert(error.response?.data?.message || 'Failed to add user.');
      }
    }
  };

  // ── Edit user ───────────────────────────────────────────────────────
  const handleEditUser = async () => {
    if (!editingUser) return;

    if (!editForm.name || !editForm.email) {
      alert('Name and email are required');
      return;
    }

    if (editForm.password && editForm.password !== editForm.password_confirmation) {
      alert('Passwords do not match');
      return;
    }

    try {
      const payload: any = {
        name:   editForm.name,
        phone:  editForm.phone,
        email:  editForm.email,
        role:   editForm.role,
        status: editForm.status,
      };

      // Only send password fields if a new password was entered
      if (editForm.password) {
        payload.password              = editForm.password;
        payload.password_confirmation = editForm.password_confirmation;
      }

      const response = await axios.put(`/settings/user/${editingUser.id}`, payload);

      // Update the user in local list
      setUsers(users.map(u => u.id === editingUser.id ? response.data.user : u));
      setShowEditModal(false);
      setEditingUser(null);
      alert('User updated successfully.');

    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors) {
        alert(Object.values(errors).flat().join('\n'));
      } else {
        alert(error.response?.data?.message || 'Failed to update user.');
      }
    }
  };

  // ── Delete user ─────────────────────────────────────────────────────
  const handleDeleteUser = async (user: SystemUser) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      await axios.delete(`/settings/delete-user/${user.id}`);
      setUsers(users.filter(u => u.id !== user.id));
      alert('User deleted successfully.');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Shared input class ───────────────────────────────────────────────
  const inputClass = 'w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none text-sm';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="min-h-screen bg-slate-50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-white border border-slate-200 rounded-xl transition-all font-medium group bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <div className="flex items-center text-sm text-slate-400">
            <Home className="w-4 h-4 mr-1" />
            <span>/ Settings / Users & Roles</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
            <p className="text-slate-500">Manage system access, roles, and team members</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
          >
            <UserPlus size={18} /> Add New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl"><Users className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-xl"><CheckCircle className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Users</p>
              <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'Active').length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Shield className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Admin Accounts</p>
              <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'Admin').length}</h3>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-800">Team Members</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        {user.status}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{user.phone || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Add User Modal ─────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Invite New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} className={inputClass} placeholder="e.g. John Doe" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={newUser.phone} onChange={(e) => setNewUser({...newUser, phone: e.target.value})} className={inputClass} placeholder="254712345678" />
              </div>
              <div>
                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className={inputClass} placeholder="user@example.com" />
              </div>
              <div>
                <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className={inputClass} placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
                <input type="password" value={newUser.confirmPassword} onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})} className={inputClass} placeholder="Re-enter password" />
              </div>
              <div>
                <label className={labelClass}>Role <span className="text-red-500">*</span></label>
                <select value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})} className={`${inputClass} bg-white`}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Support Agent">Support Agent</option>
                  <option value="Technician">Technician</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">Cancel</button>
              <button onClick={handleAddUser} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all">Send Invitation</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ────────────────────────────────────────────── */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Edit User</h2>
                <p className="text-sm text-slate-500 mt-0.5">Update details for {editingUser.name}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Role <span className="text-red-500">*</span></label>
                  <select value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value as UserRole})} className={`${inputClass} bg-white`}>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Technician">Technician</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status <span className="text-red-500">*</span></label>
                  <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value as UserStatus})} className={`${inputClass} bg-white`}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password section — optional */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-3">Leave password fields blank to keep the current password.</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>New Password</label>
                    <input type="password" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className={inputClass} placeholder="Leave blank to keep current" />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm New Password</label>
                    <input type="password" value={editForm.password_confirmation} onChange={(e) => setEditForm({...editForm, password_confirmation: e.target.value})} className={inputClass} placeholder="Re-enter new password" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">Cancel</button>
              <button onClick={handleEditUser} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
