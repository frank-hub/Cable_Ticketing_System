import React, { useState } from 'react';
import {
  Users,
  Search,
  ArrowLeft,
  Home,
  Plus,
  MoreVertical,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Lock,
  Edit2,
  UserPlus
} from 'lucide-react';
import { UserRolesProps, SystemUser, UserRole, UserStatus } from '../types';

const UserRoles: React.FC<UserRolesProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [users, setUsers] = useState<SystemUser[]>([
    {
      id: 'USR-001',
      name: 'Admin User',
      email: 'admin@nexus.com',
      role: 'Admin',
      status: 'Active',
      lastActive: 'Just now'
    },
    {
      id: 'USR-002',
      name: 'Sarah Williams',
      email: 'sarah.w@nexus.com',
      role: 'Support Agent',
      status: 'Active',
      lastActive: '5 mins ago'
    },
    {
      id: 'USR-003',
      name: 'Mike Johnson',
      email: 'mike.j@nexus.com',
      role: 'Technician',
      status: 'Active',
      lastActive: '1 hour ago'
    },
    {
      id: 'USR-004',
      name: 'Jane Smith',
      email: 'jane.s@nexus.com',
      role: 'Sales',
      status: 'Inactive',
      lastActive: '2 days ago'
    }
  ]);

  const [newUser, setNewUser] = useState<Partial<SystemUser>>({
    name: '',
    email: '',
    role: 'Support Agent',
    status: 'Active'
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Manager': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Support Agent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Technician': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Sales': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50';
      case 'Inactive': return 'text-slate-500 bg-slate-100';
      case 'Invited': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;

    const user: SystemUser = {
      id: `USR-00${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as UserRole,
      status: 'Active',
      lastActive: 'Never'
    };

    setUsers([...users, user]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'Support Agent', status: 'Active' });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2"
          >
            <UserPlus size={18} />
            Add New User
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Stats / Info Cards */}
           <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Users className="w-8 h-8" />
                  </div>
                  <div>
                      <p className="text-sm font-medium text-slate-500">Total Users</p>
                      <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                      <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                      <p className="text-sm font-medium text-slate-500">Active Sessions</p>
                      <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.status === 'Active').length}</h3>
                  </div>
              </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                      <Shield className="w-8 h-8" />
                  </div>
                  <div>
                      <p className="text-sm font-medium text-slate-500">Admin Accounts</p>
                      <h3 className="text-2xl font-bold text-slate-900">{users.filter(u => u.role === 'Admin').length}</h3>
                  </div>
              </div>
           </div>

           {/* User List */}
           <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Toolbar */}
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

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {user.name.charAt(0)}
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
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                             <div className={`w-1.5 h-1.5 rounded-full bg-current`} />
                             {user.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">{user.lastActive}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>

       {/* Add User Modal */}
       {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Invite New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                   value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                  placeholder="user@nexus.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select
                   value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                >
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
    </div>
  );
};

export default UserRoles;
