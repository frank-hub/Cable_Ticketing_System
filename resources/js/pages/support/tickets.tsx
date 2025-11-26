import React, { useState } from 'react';
import {
  Ticket,
  Search,
  Filter,
  ArrowLeft,
  Home,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Tag,
  MessageSquare,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { SupportTicketListProps, NewTicketData, Priority, Category } from '../types';

const SupportTicketList: React.FC<SupportTicketListProps> = ({ tickets: propTickets, setTickets }) => {
  // Ensure tickets is always an array to prevent "Cannot read properties of undefined (reading 'filter')"
  const tickets = propTickets || [];

  const [searchTicket, setSearchTicket] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showCreateTicket, setShowCreateTicket] = useState(false);

  const [newTicket, setNewTicket] = useState<NewTicketData>({
    customerName: '',
    accountNumber: '',
    phone: '',
    email: '',
    subject: '',
    category: 'Connectivity',
    priority: 'Medium',
    description: '',
    assignedTo: 'John Doe'
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-50 text-red-700 border-red-200';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'Closed': return 'bg-slate-50 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'In Progress': return <Clock className="w-3.5 h-3.5" />;
      case 'Resolved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Closed': return <XCircle className="w-3.5 h-3.5" />;
      default: return <AlertCircle className="w-3.5 h-3.5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white border-red-600';
      case 'High': return 'bg-orange-500 text-white border-orange-600';
      case 'Medium': return 'bg-blue-500 text-white border-blue-600';
      case 'Low': return 'bg-slate-500 text-white border-slate-600';
      default: return 'bg-slate-500 text-white border-slate-600';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Connectivity': 'bg-purple-50 text-purple-700 border-purple-200',
      'Performance': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Billing': 'bg-green-50 text-green-700 border-green-200',
      'Equipment': 'bg-orange-50 text-orange-700 border-orange-200',
      'Service Request': 'bg-blue-50 text-blue-700 border-blue-200',
      'Installation': 'bg-teal-50 text-teal-700 border-teal-200',
      'Technical': 'bg-pink-50 text-pink-700 border-pink-200',
    };
    return colors[category] ?? 'bg-slate-50 text-slate-700 border-slate-200';
  };

  const handleCreateTicket = () => {
    if (!newTicket.customerName || !newTicket.accountNumber || !newTicket.phone || !newTicket.subject || !newTicket.description) {
      alert('Please fill in all required fields');
      return;
    }

    const createdTicket = {
      ...newTicket,
      id: `TK-${2400 + tickets.length + 1}`,
      status: 'Open',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      lastUpdate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      customer: newTicket.customerName,
    };

    setTickets([createdTicket, ...tickets]);
    setShowCreateTicket(false);

    // Reset form
    setNewTicket({
      customerName: '',
      accountNumber: '',
      phone: '',
      email: '',
      subject: '',
      category: 'Connectivity',
      priority: 'Medium',
      description: '',
      assignedTo: 'John Doe'
    });
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      setTickets(tickets.filter(t => t.id !== id));
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTicket.toLowerCase()) ||
      ticket.accountNumber.toLowerCase().includes(searchTicket.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase().replace(' ', '-') === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority.toLowerCase() === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    critical: tickets.filter(t => t.priority === 'Critical').length,
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
            <span>/ Support / Tickets</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Support Tickets</h1>
            <p className="text-slate-500">Track and manage all customer support requests</p>
          </div>
          <button
            onClick={() => setShowCreateTicket(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2"
          >
            <Ticket size={18} />
            Create New Ticket
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Ticket, color: 'text-slate-600', bg: 'bg-slate-50' },
            { label: 'Open', value: stats.open, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Critical', value: stats.critical, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
          ].map((stat, idx) => (
             <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
             </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ticket ID, subject, customer, or account..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                value={searchTicket}
                onChange={(e) => setSearchTicket(e.target.value)}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <select
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-w-[140px] bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-w-[140px] bg-white"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm flex items-center gap-2">
                <Filter size={16} />
                <span className="hidden sm:inline">More</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ID & Subject</span></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</span></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</span></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</span></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span></th>
                  <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</span></th>
                  <th className="px-6 py-4 text-center"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="p-4 bg-slate-50 rounded-full mb-3">
                            <Ticket className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-lg font-medium text-slate-600">No tickets found</p>
                        <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-5 max-w-sm">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {ticket.id}
                              </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">{ticket.subject}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {ticket.lastUpdate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-slate-900">{ticket.customer}</p>
                          <p className="text-xs text-slate-500 font-mono">{ticket.accountNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border ${getCategoryColor(ticket.category)}`}>
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                          {getStatusIcon(ticket.status)}
                          <span>{ticket.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {ticket.assignedTo.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700">{ticket.assignedTo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
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

          {/* Pagination (Visual Only) */}
          {filteredTickets.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filteredTickets.length}</span> results
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

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 rounded-t-2xl z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Create New Ticket</h2>
                  <p className="text-sm text-slate-500 mt-1">Fill in the details to create a support ticket</p>
                </div>
                <button
                  onClick={() => setShowCreateTicket(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <XCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer Information Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-indigo-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Customer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTicket.customerName}
                      onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTicket.accountNumber}
                      onChange={(e) => setNewTicket({ ...newTicket, accountNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="ACC-000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newTicket.phone}
                      onChange={(e) => setNewTicket({ ...newTicket, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newTicket.email}
                      onChange={(e) => setNewTicket({ ...newTicket, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
              </section>

              {/* Ticket Details Section */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  Ticket Details
                </h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      placeholder="Brief description of the issue"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as Category })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                      >
                        <option value="Connectivity">Connectivity</option>
                        <option value="Performance">Performance</option>
                        <option value="Billing">Billing</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Service Request">Service Request</option>
                        <option value="Installation">Installation</option>
                        <option value="Technical">Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as Priority })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Assign To <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newTicket.assignedTo}
                        onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm bg-white"
                      >
                        <option value="John Doe">John Doe</option>
                        <option value="Jane Smith">Jane Smith</option>
                        <option value="Mike Johnson">Mike Johnson</option>
                        <option value="Sarah Williams">Sarah Williams</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                      placeholder="Provide detailed information about the issue..."
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateTicket(false)}
                className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:border-slate-300 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-sm"
              >
                <Ticket size={16} />
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketList;
