import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import {
  Wrench,
  Search,
  Filter,
  ArrowLeft,
  Home,
  Plus,
  XCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { InstallationsListProps, Installation, InstallationStatus } from '../types';

const InstallationsList: React.FC<InstallationsListProps> = ({ installations: propsInstallations, onBack }) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const {technicians , data} = usePage().props as any;
  
  const initialTickets = propsInstallations || data?.data || [];

  const [installations, setInstallations] = useState(initialTickets);

  const [newInstallation, setNewInstallation] = useState<Omit<Installation, 'id'>>({
    customerName: '',
    address: '',
    contactNumber: '',
    scheduledDate: '',
    technician: 'Unassigned',
    equipment: '',
    status: 'Pending',
    notes: ''
  });

  const getStatusColor = (status: InstallationStatus) => {
    switch (status) {
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Scheduled': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: InstallationStatus) => {
    switch (status) {
      case 'Completed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'Scheduled': return <Calendar className="w-3.5 h-3.5" />;
      case 'Pending': return <Clock className="w-3.5 h-3.5" />;
      default: return <Wrench className="w-3.5 h-3.5" />;
    }
  };

  const handleAddInstallation = async() => {
    if (!newInstallation.customerName || !newInstallation.address || !newInstallation.scheduledDate) {
      alert('Please fill in required fields');
      return;
    }

    try {
        const request = await axios.post('/api/customers/installations', {
            customer_name: newInstallation.customerName,
            address: newInstallation.address,
            contact_number: newInstallation.contactNumber,
            scheduled_date: newInstallation.scheduledDate,
            technician: newInstallation.technician,
            equipment: newInstallation.equipment,
            status: newInstallation.status,
            notes: newInstallation.notes
        });

        if (request.status == 200) {
            alert("Installation added successfully.");
            return;
        }

    }catch(error :any){
      console.error("Error adding installation:", error.message);
      alert("An error occurred while adding the installation. Please try again.");
      return;
    }

    const item: Installation = {
      id: `INS-${1000 + installations.length + 1}`,
      ...newInstallation,
      status: newInstallation.status as InstallationStatus
    };

    setInstallations([item, ...installations]);
    setShowAddModal(false);
    setNewInstallation({
      customerName: '',
      address: '',
      contactNumber: '',
      scheduledDate: '',
      technician: 'Unassigned',
      equipment: '',
      status: 'Pending',
      notes: ''
    });
  };

  const filteredInstallations = installations.filter(inst => {
    const matchesSearch = inst.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || inst.status === filterStatus;
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
            <span>/ Customers / Installations</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Installation Schedule</h1>
            <p className="text-slate-500">Manage new service installations and technician assignments</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 flex items-center gap-2"
          >
            <Plus size={18} />
            Schedule Installation
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer or address..."
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
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button className="px-5 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm flex items-center gap-2">
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-4">
            {filteredInstallations.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-slate-100">
                    <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                        <Wrench className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-500">No installations found matching your criteria.</p>
                </div>
            ) : (
                filteredInstallations.map((inst) => (
                    <div key={inst.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{inst.id}</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(inst.status)}`}>
                                    {getStatusIcon(inst.status)}
                                    {inst.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{inst.customerName}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {inst.address}</span>
                                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> {inst.contactNumber}</span>
                            </div>
                        </div>

                        <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Schedule</p>
                                    <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-500" />
                                        {inst.scheduledDate.replace('T', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Technician</p>
                                    <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-500" />
                                        {inst.technician}
                                    </p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Equipment Needed</p>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        {inst.equipment || 'No specific equipment listed'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                            <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                                <Wrench className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            <div className="sticky top-0 bg-white p-6 border-b border-slate-100 rounded-t-2xl z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Schedule Installation</h2>
                  <p className="text-sm text-slate-500 mt-1">Create a new installation appointment</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Name *</label>
                        <input
                            type="text"
                            value={newInstallation.customerName}
                            onChange={(e) => setNewInstallation({...newInstallation, customerName: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Number</label>
                        <input
                            type="text"
                            value={newInstallation.contactNumber}
                            onChange={(e) => setNewInstallation({...newInstallation, contactNumber: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                            placeholder="+254..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Scheduled Date *</label>
                        <input
                            type="datetime-local"
                            value={newInstallation.scheduledDate}
                            onChange={(e) => setNewInstallation({...newInstallation, scheduledDate: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Installation Address *</label>
                        <input
                            type="text"
                            value={newInstallation.address}
                            onChange={(e) => setNewInstallation({...newInstallation, address: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                            placeholder="Full street address"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Technician</label>
                         <select
                            value={newInstallation.technician}
                            onChange={(e) => setNewInstallation({...newInstallation, technician: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                         >
                            {technicians.map((tech:any) => (
                              <option key={tech.id} value={tech.name}>
                                {tech.name}
                              </option>
                            ))}
                         </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                         <select
                            value={newInstallation.status}
                            onChange={(e) => setNewInstallation({...newInstallation, status: e.target.value as InstallationStatus})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                         >
                            <option value="Pending">Pending</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In Progress">In Progress</option>
                         </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Required Equipment</label>
                        <input
                            type="text"
                            value={newInstallation.equipment}
                            onChange={(e) => setNewInstallation({...newInstallation, equipment: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm"
                            placeholder="e.g. Router Model X, 100m Fiber Cable"
                        />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                        <textarea
                            rows={3}
                            value={newInstallation.notes}
                            onChange={(e) => setNewInstallation({...newInstallation, notes: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                            placeholder="Access codes, directions, specific instructions..."
                        />
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-2xl flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:border-slate-300 transition-all font-medium text-sm">Cancel</button>
              <button onClick={handleAddInstallation} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 text-sm">
                <Calendar size={16} /> Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationsList;
