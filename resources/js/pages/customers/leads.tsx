import React, { useState } from 'react';
import {
  Target,
  Search,
  Filter,
  ArrowLeft,
  Home,
  Plus,
  XCircle,
  Phone,
  Mail,
  MoreVertical,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { LeadsListProps, Lead, LeadStatus } from '../types';

const LeadsList: React.FC<LeadsListProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'LD-5001',
      name: 'Skyline Apartments',
      email: 'manager@skyline.com',
      phone: '+254 712 345 678',
      interestLevel: 'High',
      status: 'Proposal Sent',
      source: 'Referral',
      lastContact: '2024-11-20',
      notes: 'Interested in bulk package for 20 units.'
    },
    {
      id: 'LD-5002',
      name: 'Dr. James Muriuki',
      email: 'jmuriuki@gmail.com',
      phone: '+254 722 987 654',
      interestLevel: 'Medium',
      status: 'New',
      source: 'Website',
      lastContact: '2024-11-21',
    },
    {
      id: 'LD-5003',
      name: 'Greenwood Cafe',
      email: 'hello@greenwood.co.ke',
      phone: '+254 733 111 222',
      interestLevel: 'High',
      status: 'Contacted',
      source: 'Social Media',
      lastContact: '2024-11-19',
    }
  ]);

  const [newLead, setNewLead] = useState<Omit<Lead, 'id'>>({
    name: '',
    email: '',
    phone: '',
    interestLevel: 'Medium',
    status: 'New',
    source: 'Website',
    lastContact: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Qualified': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Proposal Sent': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Converted': return 'bg-green-50 text-green-700 border-green-200';
      case 'Lost': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getInterestColor = (level: string) => {
      switch(level) {
          case 'High': return 'text-green-600 bg-green-50';
          case 'Medium': return 'text-orange-600 bg-orange-50';
          case 'Low': return 'text-slate-600 bg-slate-50';
          default: return 'text-slate-600';
      }
  };

  const handleAddLead = () => {
    if (!newLead.name || !newLead.phone) {
      alert('Please fill in required fields');
      return;
    }

    const item: Lead = {
      id: `LD-${5000 + leads.length + 1}`,
      ...newLead,
      status: newLead.status as LeadStatus
    };

    setLeads([item, ...leads]);
    setShowAddModal(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      interestLevel: 'Medium',
      status: 'New',
      source: 'Website',
      lastContact: new Date().toISOString().slice(0, 10),
      notes: ''
    });
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
            <span>/ Customers / Leads</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Sales Leads</h1>
            <p className="text-slate-500">Track and manage potential customers in the pipeline</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2"
          >
            <Plus size={18} />
            Add New Lead
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by name or email..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium min-w-[140px] bg-white"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal Sent">Proposal Sent</option>
              </select>
              <button className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm flex items-center gap-2">
                <Filter size={16} />
                Sort
              </button>
            </div>
          </div>
        </div>

        {/* Pipeline / List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead Info</span></th>
                            <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</span></th>
                            <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</span></th>
                            <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interest</span></th>
                            <th className="px-6 py-4 text-left"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</span></th>
                            <th className="px-6 py-4 text-center"><span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLeads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No leads found.</td>
                            </tr>
                        ) : (
                            filteredLeads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                                            <p className="text-xs text-slate-500">Added: {lead.lastContact}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Mail className="w-3 h-3" /> {lead.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Phone className="w-3 h-3" /> {lead.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                         <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(lead.status)}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${getInterestColor(lead.interestLevel)}`}>
                                            {lead.interestLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {lead.source}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
             </div>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 rounded-t-2xl z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">New Lead</h2>
                  <p className="text-sm text-slate-500 mt-1">Add a prospective customer to the pipeline</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Name / Company *</label>
                        <input
                            type="text"
                            value={newLead.name}
                            onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
                        <input
                            type="tel"
                            value={newLead.phone}
                            onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            type="email"
                            value={newLead.email}
                            onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Interest Level</label>
                         <select
                            value={newLead.interestLevel}
                            onChange={(e) => setNewLead({...newLead, interestLevel: e.target.value as any})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                         >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                         </select>
                    </div>
                     <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
                         <select
                            value={newLead.source}
                            onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                         >
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Cold Call">Cold Call</option>
                         </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                        <textarea
                            rows={3}
                            value={newLead.notes}
                            onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                            placeholder="Customer requirements, preferences..."
                        />
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:border-slate-300 transition-all font-medium text-sm">Cancel</button>
              <button onClick={handleAddLead} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-sm">
                <Target size={16} /> Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;
