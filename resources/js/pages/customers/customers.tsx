import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Package,
  ArrowLeft,
  Home,
  Filter,
  Eye,
  Edit,
  Trash2,
  XCircle,
  Plus
} from 'lucide-react';

const CustomerListTable: React.FC = () => {
  const [searchCustomer, setSearchCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const [customers, setCustomers] = useState([
    { id: 1, name: 'SLAUGHTERS', accountNumber: 'ACC-001', phone: '+254 700 123 456', email: 'info@slaughters.co.ke', package: 'Premium 100Mbps', status: 'Active', installationDate: '2024-01-15', lastPayment: '2024-11-01' },
    { id: 2, name: 'PRESTIGE HOSPITAL', accountNumber: 'ACC-002', phone: '+254 700 234 567', email: 'it@prestigehosp.com', package: 'Business 200Mbps', status: 'Active', installationDate: '2024-02-20', lastPayment: '2024-11-05' },
    { id: 3, name: 'OBAMA ESTATE', accountNumber: 'ACC-003', phone: '+254 700 345 678', email: 'admin@obamaestate.co.ke', package: 'Standard 50Mbps', status: 'Active', installationDate: '2024-03-10', lastPayment: '2024-10-28' },
    { id: 4, name: 'KANTARAMA', accountNumber: 'ACC-004', phone: '+254 700 456 789', email: 'contact@kantarama.com', package: 'Premium 100Mbps', status: 'Suspended', installationDate: '2024-04-05', lastPayment: '2024-09-15' },
    { id: 5, name: 'OMEGA ESTATE', accountNumber: 'ACC-005', phone: '+254 700 567 890', email: 'info@omegaestate.co.ke', package: 'Basic 20Mbps', status: 'Active', installationDate: '2024-05-12', lastPayment: '2024-11-10' },
    { id: 6, name: 'DHAMA ESTATE', accountNumber: 'ACC-006', phone: '+254 700 678 901', email: 'admin@dhamaestate.com', package: 'Standard 50Mbps', status: 'Active', installationDate: '2024-06-18', lastPayment: '2024-11-02' },
    { id: 7, name: 'NAIRU', accountNumber: 'ACC-007', phone: '+254 700 789 012', email: 'info@nairu.co.ke', package: 'Premium 100Mbps', status: 'Inactive', installationDate: '2024-07-22', lastPayment: '2024-08-20' },
    { id: 8, name: 'KAHAWA', accountNumber: 'ACC-008', phone: '+254 700 890 123', email: 'contact@kahawa.com', package: 'Business 200Mbps', status: 'Active', installationDate: '2024-08-30', lastPayment: '2024-11-08' },
    { id: 9, name: 'RIDGEWAYS', accountNumber: 'ACC-009', phone: '+254 700 901 234', email: 'info@ridgeways.co.ke', package: 'Premium 100Mbps', status: 'Active', installationDate: '2024-09-05', lastPayment: '2024-11-12' },
    { id: 10, name: 'RUIRU ESTATE', accountNumber: 'ACC-010', phone: '+254 700 012 345', email: 'admin@ruiruestate.com', package: 'Standard 50Mbps', status: 'Active', installationDate: '2024-10-01', lastPayment: '2024-11-15' },
  ]);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    accountNumber: '',
    phone: '',
    email: '',
    package: 'Standard 50Mbps',
    status: 'Active',
    installationDate: new Date().toISOString().slice(0, 10),
  });

  const getCustomerStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'Suspended': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Inactive': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPackageColor = (pkg: string | string[]) => {
    if (pkg.includes('Business')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (pkg.includes('Premium')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (pkg.includes('Standard')) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                         customer.accountNumber.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchCustomer.toLowerCase()) ||
                         customer.phone.includes(searchCustomer);
    const matchesStatus = filterStatus === 'all' || customer.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'Active').length,
    suspended: customers.filter(c => c.status === 'Suspended').length,
    inactive: customers.filter(c => c.status === 'Inactive').length,
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.accountNumber || !newCustomer.phone) {
      alert('Please fill in required fields');
      return;
    }

    const customerToAdd = {
      id: customers.length + 1,
      ...newCustomer,
      lastPayment: '-' // Default for new customer
    };

    setCustomers([customerToAdd, ...customers]);
    setShowAddCustomer(false);

    // Reset form
    setNewCustomer({
      name: '',
      accountNumber: '',
      phone: '',
      email: '',
      package: 'Standard 50Mbps',
      status: 'Active',
      installationDate: new Date().toISOString().slice(0, 10),
    });
  };

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
            <span>/ Customers / Customer List</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Customer Management</h1>
            <p className="text-slate-500">Manage and view all your customers</p>
          </div>
          <button
            onClick={() => setShowAddCustomer(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2"
          >
            <Users size={18} />
            Add New Customer
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Total</p>
              <p className="text-xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="p-2 rounded-lg bg-indigo-50">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
              <p className="text-xl font-bold text-slate-800">{stats.active}</p>
            </div>
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Suspended</p>
              <p className="text-xl font-bold text-slate-800">{stats.suspended}</p>
            </div>
            <div className="p-2 rounded-lg bg-yellow-50">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Inactive</p>
              <p className="text-xl font-bold text-slate-800">{stats.inactive}</p>
            </div>
            <div className="p-2 rounded-lg bg-red-50">
              <Clock className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, account number, email, or phone..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-w-[140px] bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
              <button className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm flex items-center gap-2">
                <Filter size={16} />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Package</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Payment</span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="p-4 bg-slate-50 rounded-full mb-3">
                            <Users className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">No customers found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {customer.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-mono font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded w-fit text-center border border-slate-200">{customer.accountNumber}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            Since {customer.installationDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                             <Phone className="w-3 h-3" />
                          </div>
                          {customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${getPackageColor(customer.package)}`}>
                          <Package className="w-3.5 h-3.5" />
                          {customer.package}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border gap-1.5 ${getCustomerStatusColor(customer.status)}`}>
                          {customer.status === 'Active' && <CheckCircle className="w-3.5 h-3.5" />}
                          {customer.status === 'Suspended' && <AlertCircle className="w-3.5 h-3.5" />}
                          {customer.status === 'Inactive' && <Clock className="w-3.5 h-3.5" />}
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">{customer.lastPayment}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filteredCustomers.length}</span> results
              </p>
              <div className="flex items-center gap-2">
                <button disabled className="px-3 py-1.5 border border-slate-200 text-slate-400 rounded-lg cursor-not-allowed text-sm font-medium">
                  Previous
                </button>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-sm">
                  1
                </button>
                <button className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-white hover:border-indigo-300 transition-colors text-sm font-medium">
                  2
                </button>
                <button className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-white hover:border-indigo-300 transition-colors text-sm font-medium">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add New Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 rounded-t-2xl z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">New Customer</h2>
                  <p className="text-sm text-slate-500 mt-1">Onboard a new customer to the system</p>
                </div>
                <button
                  onClick={() => setShowAddCustomer(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer Identity Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Identity & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Customer/Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="e.g. John Doe or Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.accountNumber}
                      onChange={(e) => setNewCustomer({ ...newCustomer, accountNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="e.g. ACC-123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Primary Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="contact@email.com"
                    />
                  </div>
                </div>
              </section>

              {/* Service Details Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Service Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Service Package
                    </label>
                    <select
                      value={newCustomer.package}
                      onChange={(e) => setNewCustomer({ ...newCustomer, package: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                    >
                      <option value="Basic 20Mbps">Basic 20Mbps</option>
                      <option value="Standard 50Mbps">Standard 50Mbps</option>
                      <option value="Premium 100Mbps">Premium 100Mbps</option>
                      <option value="Business 200Mbps">Business 200Mbps</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Initial Status
                    </label>
                    <select
                      value={newCustomer.status}
                      onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Installation Date
                    </label>
                    <input
                      type="date"
                      value={newCustomer.installationDate}
                      onChange={(e) => setNewCustomer({ ...newCustomer, installationDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={() => setShowAddCustomer(false)}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:border-slate-300 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-sm"
              >
                <Plus size={16} />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListTable;
