import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  Home,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  MessageSquare,
  Edit,
  Save,
  X,
  Flag,
  Zap,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  AlertTriangle,
  Send,
  Paperclip,
  History,
  Star,
  XCircle
} from 'lucide-react';

interface TicketNote {
  id: number;
  note: string;
  author_name: string;
  is_internal: boolean;
  created_at: string;
}

interface TicketDetails {
  id: number;
  ticket_number: string;
  customer_name: string;
  account_number: string;
  phone: string;
  email: string;
  subject: string;
  ticket_type: string;
  escalation_level: string;
  priority: string;
  category: string;
  description: string;
  assigned_to: string;
  status: string;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  response_time_minutes: number | null;
  resolution_time_minutes: number | null;

  started_at: string | null;  // When technician clicked "Start Working"
  paused_at: string | null;   // When ticket was put "On Hold"
  total_paused_minutes: number;

  resolution_summary: string | null;
  satisfaction_rating: number | null;
  created_at: string;
  updated_at: string;
  notes: TicketNote[];
}

const TicketDetailsPage = () => {
  const [ticket, setTicket] = useState<TicketDetails>({
  ...usePage().props.data as TicketDetails,
  started_at: null,
  paused_at: null,
  total_paused_minutes: 0
});

  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [selectedEscalationLevel, setSelectedEscalationLevel] = useState('Level 2');

  const [editableTicket, setEditableTicket] = useState({
    status: ticket.status,
    priority: ticket.priority,
    assigned_to: ticket.assigned_to,
    escalation_level: ticket.escalation_level
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-50 text-red-700 border-red-200';
      case 'In Progress': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'Closed': return 'bg-slate-50 text-slate-700 border-slate-200';
      case 'On Hold': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    const note: TicketNote = {
      id: ticket.notes.length + 1,
      note: newNote,
      author_name: 'Current User',
      is_internal: isInternalNote,
      created_at: new Date().toISOString()
    };

    setTicket({
      ...ticket,
      notes: [...ticket.notes, note],
      updated_at: new Date().toISOString()
    });

    setNewNote('');
    setIsInternalNote(false);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setTicket({ ...ticket, status: newStatus, updated_at: new Date().toISOString() });
  };

  const handleSaveChanges = async () => {
    setTicket({
      ...ticket,
      ...editableTicket,
      updated_at: new Date().toISOString()
    });
    setIsEditing(false);
  };

  const handleEscalate = async () => {
    if (!escalationReason.trim()) {
      alert('Please provide a reason for escalation');
      return;
    }

    setTicket({
      ...ticket,
      escalation_level: selectedEscalationLevel,
      priority: selectedEscalationLevel === 'Level 3' ? 'Critical' : ticket.priority,
      updated_at: new Date().toISOString()
    });

    const escalationNote: TicketNote = {
      id: ticket.notes.length + 1,
      note: `Escalated to ${selectedEscalationLevel}. Reason: ${escalationReason}`,
      author_name: 'System',
      is_internal: true,
      created_at: new Date().toISOString()
    };

    setTicket(prev => ({
      ...prev,
      notes: [...prev.notes, escalationNote]
    }));

    setShowEscalateModal(false);
    setEscalationReason('');
  };

    const handleResolve = async () => {
        if (!resolutionSummary.trim()) {
            alert('Please provide a resolution summary');
            return;
        }

        const resolveTime = new Date().toISOString();
        
        // Calculate resolution time (from start_working to resolved, excluding paused time)
        let resolutionMinutes = 0;
        if (ticket.started_at) {
            const totalMinutes = Math.floor(
            (new Date(resolveTime).getTime() - new Date(ticket.started_at).getTime()) / 60000
            );
            // Subtract paused time
            resolutionMinutes = totalMinutes - ticket.total_paused_minutes;
        }

        setTicket({
            ...ticket,
            status: 'Resolved',
            resolved_at: resolveTime,
            resolution_summary: resolutionSummary,
            resolution_time_minutes: resolutionMinutes,
            updated_at: resolveTime
        });

        const resolveNote: TicketNote = {
            id: ticket.notes.length + 1,
            note: `Ticket resolved. Total active work time: ${formatDuration(resolutionMinutes)}`,
            author_name: 'System',
            is_internal: true,
            created_at: resolveTime
        };

        setTicket(prev => ({
            ...prev,
            notes: [...prev.notes, resolveNote]
        }));

        setShowResolveModal(false);
        setResolutionSummary('');
    };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
// ..................................................SLA Metrics.........................
    const SLA_TARGETS: Record<string, { responseMinutes: number; resolutionMinutes: number }> = {
        Critical: {
            responseMinutes: 60,      // 1 hour
            resolutionMinutes: 240    // 4 hours
        },
        High: {
            responseMinutes: 240,     // 4 hours
            resolutionMinutes: 1440   // 24 hours
        },
        Medium: {
            responseMinutes: 480,     // 8 hours
            resolutionMinutes: 4320   // 3 days
        },
        Low: {
            responseMinutes: 1440,    // 24 hours
            resolutionMinutes: 10080  // 7 days
        }
    };


    const handleStartWorking = async () => {
  const startTime = new Date().toISOString();
  
  // Calculate response time (time from creation to starting work)
    const responseMinutes = Math.floor(
            (new Date(startTime).getTime() - new Date(ticket.created_at).getTime()) / 60000
        );

        setTicket({
            ...ticket,
            status: 'In Progress',
            started_at: startTime,
            first_response_at: startTime,
            response_time_minutes: responseMinutes,
            updated_at: startTime
        });

        // Add system note
        const startNote: TicketNote = {
            id: ticket.notes.length + 1,
            note: `Technician started working on ticket. Response time: ${formatDuration(responseMinutes)}`,
            author_name: 'System',
            is_internal: true,
            created_at: startTime
        };

        setTicket(prev => ({
            ...prev,
            notes: [...prev.notes, startNote]
        }));
    };

    const handlePutOnHold = async () => {
        const holdTime = new Date().toISOString();

        setTicket({
            ...ticket,
            status: 'On Hold',
            paused_at: holdTime,
            updated_at: holdTime
        });

        const holdNote: TicketNote = {
            id: ticket.notes.length + 1,
            note: 'Ticket put on hold. SLA timer paused.',
            author_name: 'System',
            is_internal: true,
            created_at: holdTime
        };

        setTicket(prev => ({
            ...prev,
            notes: [...prev.notes, holdNote]
        }));
    };

    const handleResumeFromHold = async () => {
        const resumeTime = new Date().toISOString();
        
        // Calculate how long it was paused
        const pausedMinutes = Math.floor(
            (new Date(resumeTime).getTime() - new Date(ticket.paused_at!).getTime()) / 60000
        );

        setTicket({
            ...ticket,
            status: 'In Progress',
            paused_at: null,
            total_paused_minutes: ticket.total_paused_minutes + pausedMinutes,
            updated_at: resumeTime
        });

        const resumeNote: TicketNote = {
            id: ticket.notes.length + 1,
            note: `Ticket resumed. Was on hold for ${formatDuration(pausedMinutes)}. SLA timer resumed.`,
            author_name: 'System',
            is_internal: true,
            created_at: resumeTime
        };

        setTicket(prev => ({
            ...prev,
            notes: [...prev.notes, resumeNote]
        }));
    };

    const calculateSLAStatus = (
response_time_minutes: number | null, responseMinutes: number, p0: boolean, type: 'response' | 'resolution', priority: string        ) => {
        const target = type === 'response' 
            ? SLA_TARGETS[priority].responseMinutes 
            : SLA_TARGETS[priority].resolutionMinutes;

        let elapsed = 0;
        let isCompleted = false;

        if (type === 'response') {
            // Response SLA: Time from created to started_at
            if (ticket.started_at) {
            elapsed = ticket.response_time_minutes || 0;
            isCompleted = true;
            } else {
            // Still waiting to start
            elapsed = Math.floor(
                (new Date().getTime() - new Date(ticket.created_at).getTime()) / 60000
            );
            }
        } else {
            // Resolution SLA: Time from started_at to resolved_at (excluding paused time)
            if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
            elapsed = ticket.resolution_time_minutes || 0;
            isCompleted = true;
            } else if (ticket.started_at) {
            // Currently in progress
            const totalMinutes = Math.floor(
                (new Date().getTime() - new Date(ticket.started_at).getTime()) / 60000
            );
            
            // If currently paused, add time since pause started
            let currentPausedMinutes = ticket.total_paused_minutes;
            if (ticket.status === 'On Hold' && ticket.paused_at) {
                currentPausedMinutes += Math.floor(
                (new Date().getTime() - new Date(ticket.paused_at).getTime()) / 60000
                );
            }
            
            elapsed = totalMinutes - currentPausedMinutes;
            } else {
            // Not started yet
            return { status: 'not-started', color: 'gray', percentage: 0 };
            }
        }

        // Determine status
        if (isCompleted) {
            if (elapsed <= target) {
            return { status: 'met', color: 'green', percentage: (elapsed / target) * 100 };
            } else {
            return { status: 'breached', color: 'red', percentage: 100 };
            }
        }

        // In progress
        const percentage = (elapsed / target) * 100;
        if (elapsed > target) {
            return { status: 'breached', color: 'red', percentage: 100 };
        } else if (percentage > 80) {
            return { status: 'at-risk', color: 'orange', percentage };
        } else {
            return { status: 'on-track', color: 'green', percentage };
        }
    };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-white border border-slate-200 rounded-xl transition-all font-medium group bg-white shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Tickets
          </button>
          <div className="flex items-center text-sm text-slate-400">
            <Home className="w-4 h-4 mr-1" />
            <span>/ Support / Tickets / {ticket.ticket_number}</span>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">{ticket.ticket_number}</h1>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  {ticket.escalation_level !== 'Level 1' && (
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${
                      ticket.escalation_level === 'Level 3' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      <Flag className="w-3 h-3" />
                      {ticket.escalation_level}
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-slate-700">{ticket.subject}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              {isEditing ? (
                <select
                  value={editableTicket.status}
                  onChange={(e) => setEditableTicket({ ...editableTicket, status: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border mt-2 ${getStatusColor(ticket.status)}`}>
                  {ticket.status === 'Open' && <AlertCircle className="w-3 h-3" />}
                  {ticket.status === 'In Progress' && <Clock className="w-3 h-3" />}
                  {ticket.status === 'Resolved' && <CheckCircle className="w-3 h-3" />}
                  {ticket.status}
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned To</label>
              {isEditing ? (
                <select
                  value={editableTicket.assigned_to}
                  onChange={(e) => setEditableTicket({ ...editableTicket, assigned_to: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="John Doe">John Doe</option>
                  <option value="Jane Smith">Jane Smith</option>
                  <option value="Mike Johnson">Mike Johnson</option>
                  <option value="Sarah Williams">Sarah Williams</option>
                </select>
              ) : (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {ticket.assigned_to.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{ticket.assigned_to}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
              <p className="text-sm font-medium text-slate-700 mt-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                {ticket.ticket_type}
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
              <p className="text-sm font-medium text-slate-700 mt-2">{ticket.category}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Name</label>
                  <p className="text-sm font-medium text-slate-900 mt-1">{ticket.customer_name}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Number</label>
                  <p className="text-sm font-mono font-medium text-slate-900 mt-1">{ticket.account_number}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</label>
                  <a href={`tel:${ticket.phone}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {ticket.phone}
                  </a>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                  <a href={`mailto:${ticket.email}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {ticket.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Description
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
            </div>

            {/* Resolution Summary (if resolved) */}
            {ticket.resolution_summary && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
                <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Resolution Summary
                </h3>
                <p className="text-sm text-green-800 leading-relaxed">{ticket.resolution_summary}</p>
                {ticket.resolved_at && (
                  <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Resolved on: {new Date(ticket.resolved_at).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Notes/Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Activity & Notes ({ticket.notes.length})
              </h3>

              <div className="space-y-4 mb-6">
                {ticket.notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      note.is_internal
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-slate-50 border-indigo-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {note.author_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{note.author_name}</p>
                          <p className="text-xs text-slate-500">{new Date(note.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {note.is_internal && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-200 text-amber-800 rounded">
                          Internal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 ml-10">{note.note}</p>
                  </div>
                ))}
              </div>

              {/* Add Note Form */}
              <div className="border-t border-slate-100 pt-6">
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Add Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  placeholder="Add update or comment..."
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Mark as internal note
                  </label>
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
                {/* Start Working - Only show if not started yet */}
                {!ticket.started_at && ticket.status === 'Open' && (
                <button
                    onClick={handleStartWorking}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Clock className="w-4 h-4" />
                    Start Working
                </button>
                )}

                {/* Resume from Hold */}
                {ticket.status === 'On Hold' && (
                <button
                    onClick={handleResumeFromHold}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Clock className="w-4 h-4" />
                    Resume Work
                </button>
                )}

                {/* Put On Hold - Only show if in progress */}
                {ticket.status === 'In Progress' && (
                <button
                    onClick={handlePutOnHold}
                    className="w-full px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                    <AlertCircle className="w-4 h-4" />
                    Put On Hold
                </button>
                )}

                {/* Mark as Resolved */}
                {ticket.started_at && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <button
                    onClick={() => setShowResolveModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Resolved
                </button>
                )}

                {/* Close Ticket */}
                {ticket.status === 'Resolved' && (
                <button
                    onClick={() => handleUpdateStatus('Closed')}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                    <XCircle className="w-4 h-4" />
                    Close Ticket
                </button>
                )}

                {/* Escalate */}
                <button
                onClick={() => setShowEscalateModal(true)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                <Flag className="w-4 h-4" />
                Escalate
                </button>
            </div>
            </div>

            {/* SLA Metrics */}
            {/* SLA Metrics */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
    <TrendingUp className="w-5 h-5 text-indigo-600" />
    SLA Metrics
  </h3>
  <div className="space-y-4">
    {/* Response Time SLA (Time to Start Working) */}
    <div>
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Time to Start Working
            </label>
            {(() => {
            const sla = calculateSLAStatus(
              ticket.response_time_minutes ?? null,
              ticket.response_time_minutes ?? 0,
              false,
              'response',
              ticket.priority
            );
            return (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                sla.status === 'met' || sla.status === 'on-track' 
                    ? 'bg-green-100 text-green-700'
                    : sla.status === 'at-risk'
                    ? 'bg-orange-100 text-orange-700'
                    : sla.status === 'not-started'
                    ? 'bg-gray-100 text-gray-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                {sla.status === 'met' ? 'MET' : 
                sla.status === 'on-track' ? 'ON TRACK' :
                sla.status === 'at-risk' ? 'AT RISK' :
                sla.status === 'not-started' ? 'WAITING' : 'BREACHED'}
                </span>
            );
            })()}
        </div>
        
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-slate-900">
                {ticket.started_at 
                ? formatDuration(ticket.response_time_minutes)
                : formatDuration(Math.floor((new Date().getTime() - new Date(ticket.created_at).getTime()) / 60000))
                }
            </span>
            <span className="text-slate-500">
                Target: {formatDuration(SLA_TARGETS[ticket.priority].responseMinutes)}
            </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            {(() => {
                const sla = calculateSLAStatus(
                  ticket.response_time_minutes ?? null,
                  ticket.response_time_minutes ?? 0,
                  false,
                  'response',
                  ticket.priority
                );
                return (
                <div 
                    className={`h-full transition-all ${
                    sla.status === 'met' || sla.status === 'on-track'
                        ? 'bg-green-500'
                        : sla.status === 'at-risk'
                        ? 'bg-orange-500'
                        : sla.status === 'not-started'
                        ? 'bg-gray-400'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(sla.percentage, 100)}%` }}
                />
                );
            })()}
            </div>
        </div>
        
        {ticket.started_at && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Started working: {new Date(ticket.started_at).toLocaleString()}
            </p>
        )}
        </div>

        {/* Resolution Time SLA (Active Work Time) */}
        {ticket.started_at && (
        <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Work Time
            </label>
            {(() => {
                const sla = calculateSLAStatus(
                  ticket.resolution_time_minutes ?? null,
                  ticket.resolution_time_minutes ?? 0,
                  false,
                  'resolution',
                  ticket.priority
                );
                return (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    sla.status === 'met' || sla.status === 'on-track'
                    ? 'bg-green-100 text-green-700'
                    : sla.status === 'at-risk'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                    {sla.status === 'met' ? 'MET' :
                    sla.status === 'on-track' ? 'ON TRACK' :
                    sla.status === 'at-risk' ? 'AT RISK' : 'BREACHED'}
                </span>
                );
            })()}
            </div>
            
            <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">
                {ticket.resolution_time_minutes 
                    ? formatDuration(ticket.resolution_time_minutes)
                    : formatDuration(
                        Math.floor((new Date().getTime() - new Date(ticket.started_at).getTime()) / 60000) 
                        - ticket.total_paused_minutes
                        - (ticket.status === 'On Hold' && ticket.paused_at 
                        ? Math.floor((new Date().getTime() - new Date(ticket.paused_at).getTime()) / 60000)
                        : 0)
                    )}
                </span>
                <span className="text-slate-500">
                Target: {formatDuration(SLA_TARGETS[ticket.priority].resolutionMinutes)}
                </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                {(() => {
                const sla = calculateSLAStatus(
                  ticket.resolution_time_minutes ?? null,
                  ticket.resolution_time_minutes ?? 0,
                  false,
                  'resolution',
                  ticket.priority
                );
                return (
                    <div 
                    className={`h-full transition-all ${
                        sla.status === 'met' || sla.status === 'on-track'
                        ? 'bg-green-500'
                        : sla.status === 'at-risk'
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(sla.percentage, 100)}%` }}
                    />
                );
                })()}
            </div>
            </div>

            {/* Show paused time if any */}
            {ticket.total_paused_minutes > 0 && (
            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Paused time (excluded): {formatDuration(ticket.total_paused_minutes)}
            </p>
            )}

            {ticket.status === 'On Hold' && (
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 animate-pulse" />
                Currently on hold - SLA timer paused
            </p>
            )}
        </div>
        )}

        {/* Timestamps */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
        <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</label>
            <p className="text-sm text-slate-700 mt-1">{new Date(ticket.created_at).toLocaleString()}</p>
        </div>

        {ticket.started_at && (
            <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Started</label>
            <p className="text-sm text-slate-700 mt-1">{new Date(ticket.started_at).toLocaleString()}</p>
            </div>
        )}

        <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Updated</label>
            <p className="text-sm text-slate-700 mt-1">{new Date(ticket.updated_at).toLocaleString()}</p>
        </div>
        </div>
    </div>
    </div>
            {/* Customer Satisfaction */}
            {ticket.satisfaction_rating && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Customer Rating</h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= ticket.satisfaction_rating!
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mt-2">{ticket.satisfaction_rating} out of 5 stars</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Escalate Ticket
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Escalation Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEscalationLevel}
                  onChange={(e) => setSelectedEscalationLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Level 2">Level 2 (Escalated)</option>
                  <option value="Level 3">Level 3 (Critical)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Escalation <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Provide reason for escalation..."
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Escalate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Resolve Ticket
            </h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resolution Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Provide a summary of the resolution..."
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsPage;
