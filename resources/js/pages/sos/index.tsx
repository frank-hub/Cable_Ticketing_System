import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    AlertTriangle, Wifi, Users, ShieldAlert, MessageSquare,
    Send, Clock, CheckCircle, XCircle, ArrowLeft, Home,
    Siren, CheckCheck
} from 'lucide-react';

interface SosHistory {
    id: number;
    type: string;
    type_label: string;
    message: string;
    triggered_by: string;
    triggered_by_id: number;
    triggered_role: string;
    notified_count: number;
    status: 'sent' | 'failed' | 'partial' | 'resolved';
    resolved_by: string | null;
    resolved_at: string | null;
    created_at: string;
}

interface PageProps {
    history: SosHistory[];
    flash: { success?: string; error?: string };
    auth: { user: { id: number; name: string; role: string } };
    [key: string]: unknown;
}

const ALERT_TYPES = [
    {
        key:         'network_outage',
        label:       'Network Outage',
        description: 'Report a major network outage affecting customers',
        icon:        Wifi,
        color:       'border-red-400 bg-red-50 text-red-700',
        activeColor: 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-500/30',
        iconColor:   'text-red-500',
    },
    {
        key:         'urgent_backup',
        label:       'Urgent Backup Needed',
        description: 'Request immediate technician backup on-site',
        icon:        Users,
        color:       'border-orange-400 bg-orange-50 text-orange-700',
        activeColor: 'border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-500/30',
        iconColor:   'text-orange-500',
    },
    {
        key:         'safety_incident',
        label:       'Safety Incident',
        description: 'Flag a safety or security incident immediately',
        icon:        ShieldAlert,
        color:       'border-yellow-400 bg-yellow-50 text-yellow-700',
        activeColor: 'border-yellow-600 bg-yellow-600 text-white shadow-lg shadow-yellow-500/30',
        iconColor:   'text-yellow-500',
    },
    {
        key:         'emergency_sms',
        label:       'Emergency SMS',
        description: 'Send a custom emergency message to all technicians',
        icon:        MessageSquare,
        color:       'border-purple-400 bg-purple-50 text-purple-700',
        activeColor: 'border-purple-600 bg-purple-600 text-white shadow-lg shadow-purple-500/30',
        iconColor:   'text-purple-500',
    },
];

const SosPage = () => {
    const { history, flash, auth } = usePage<PageProps>().props;
    const currentUserId = auth.user.id;

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [message, setMessage]           = useState('');
    const [processing, setProcessing]     = useState(false);
    const [resolving, setResolving]       = useState<number | null>(null);
    const [confirmed, setConfirmed]       = useState(false);

    const selectedAlert = ALERT_TYPES.find(a => a.key === selectedType);

    // ── Trigger SOS ───────────────────────────────────────────────────
    const handleTrigger = () => {
        if (!selectedType)     { alert('Please select an alert type.'); return; }
        if (!message.trim())   { alert('Please provide a message.'); return; }
        if (!confirmed)        { alert('Please confirm before sending.'); return; }

        setProcessing(true);
        router.post('/sos', { type: selectedType, message }, {
            preserveScroll: true,
            onSuccess: () => { setSelectedType(null); setMessage(''); setConfirmed(false); },
            onFinish:  () => setProcessing(false),
        });
    };

    // ── Resolve SOS ───────────────────────────────────────────────────
    const handleResolve = (alertId: number) => {
        if (!window.confirm('Mark this SOS as resolved? A thank-you SMS will be sent to all technicians.')) return;

        setResolving(alertId);
        router.post(`/sos/${alertId}/resolve`, {}, {
            preserveScroll: true,
            onFinish: () => setResolving(null),
        });
    };

    // ── Status badge ──────────────────────────────────────────────────
    const statusBadge = (status: string) => {
        switch (status) {
            case 'sent':     return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Sent</span>;
            case 'failed':   return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Failed</span>;
            case 'partial':  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700"><AlertTriangle className="w-3 h-3" />Partial</span>;
            case 'resolved': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><CheckCheck className="w-3 h-3" />Resolved</span>;
            default:         return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-white border border-slate-200 rounded-xl transition-all font-medium group bg-white shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="flex items-center text-sm text-slate-400">
                        <Home className="w-4 h-4 mr-1" />
                        <span>/ SOS Alert</span>
                    </div>
                </div>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm font-medium">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl shadow-red-500/30">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Siren className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">SOS Emergency Alert</h1>
                            <p className="text-red-100 text-sm mt-1">
                                Triggers an immediate SMS to all active technicians. Use only in genuine emergencies.
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-red-200 bg-white/10 rounded-lg px-3 py-2 w-fit">
                        <Clock className="w-3.5 h-3.5" />
                        Triggering as: <span className="font-semibold text-white ml-1">{auth.user.name} ({auth.user.role})</span>
                    </div>
                </div>

                {/* Step 1 — Alert type */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        1. Select Alert Type <span className="text-red-500">*</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ALERT_TYPES.map((alert) => {
                            const isSelected = selectedType === alert.key;
                            const Icon       = alert.icon;
                            return (
                                <button
                                    key={alert.key}
                                    onClick={() => setSelectedType(alert.key)}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                                        isSelected ? alert.activeColor : `${alert.color} hover:border-opacity-80`
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-white/20' : 'bg-white'}`}>
                                        <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : alert.iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{alert.label}</p>
                                        <p className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'opacity-75'}`}>
                                            {alert.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Step 2 — Message */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">
                        2. Describe the Situation <span className="text-red-500">*</span>
                    </h2>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        maxLength={500}
                        placeholder="Provide clear details — location, severity, what's needed..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-2 text-right">{message.length}/500</p>
                </div>

                {/* Step 3 — Confirm & Send */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">3. Confirm & Send</h2>

                    {selectedAlert && (
                        <div className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm space-y-1.5">
                            <p><span className="font-semibold text-slate-600">Alert type:</span> {selectedAlert.label}</p>
                            <p><span className="font-semibold text-slate-600">Message:</span> {message || <span className="text-slate-400 italic">not entered yet</span>}</p>
                            <p><span className="font-semibold text-slate-600">Recipients:</span> All active Technicians via SMS</p>
                        </div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer mb-6">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-slate-700">
                            I confirm this is a genuine emergency and understand that all active technicians will receive an SMS immediately.
                        </span>
                    </label>

                    <button
                        onClick={handleTrigger}
                        disabled={processing || !selectedType || !message.trim() || !confirmed}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
                    >
                        <Send className="w-5 h-5" />
                        {processing ? 'Sending SOS...' : 'TRIGGER SOS ALERT'}
                    </button>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Recent SOS History</h2>
                        <p className="text-sm text-slate-500 mt-1">Last 20 alerts — you can resolve alerts you triggered</p>
                    </div>

                    {history.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                            <Siren className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                            <p className="font-medium">No SOS alerts triggered yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Triggered By</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notified</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((alert) => {
                                        const isOwner     = alert.triggered_by_id === currentUserId;
                                        const canResolve  = isOwner && alert.status !== 'resolved' && alert.status !== 'failed';
                                        const isResolving = resolving === alert.id;

                                        return (
                                            <tr key={alert.id} className={`transition-colors ${alert.status === 'resolved' ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-slate-800">{alert.type_label}</span>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-sm text-slate-600 truncate">{alert.message}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-medium text-slate-800">{alert.triggered_by}</p>
                                                    <p className="text-xs text-slate-500">{alert.triggered_role}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-800">{alert.notified_count}</span>
                                                    <span className="text-xs text-slate-500 ml-1">tech(s)</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        {statusBadge(alert.status)}
                                                        {alert.status === 'resolved' && alert.resolved_by && (
                                                            <p className="text-xs text-slate-500">by {alert.resolved_by}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {alert.created_at}
                                                        </p>
                                                        {alert.resolved_at && (
                                                            <p className="text-xs text-blue-500 flex items-center gap-1">
                                                                <CheckCheck className="w-3 h-3" /> {alert.resolved_at}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {canResolve ? (
                                                        <button
                                                            onClick={() => handleResolve(alert.id)}
                                                            disabled={isResolving}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm shadow-green-500/20"
                                                        >
                                                            <CheckCheck className="w-3.5 h-3.5" />
                                                            {isResolving ? 'Resolving...' : 'Resolve'}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            {alert.status === 'resolved' ? '—' : !isOwner ? 'Not yours' : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SosPage;
