import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    User, MapPin, Phone, Mail, Calendar, Wrench,
    ClipboardList, Clock, ChevronLeft, Trash2, Save,
    AlertCircle, CheckCircle, XCircle, Loader2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Technician {
    id: number;
    name: string;
}

interface TimelineEntry {
    id: number;
    action: string;
    actor: string;
    created_at: string;
}

interface Installation {
    id: string;
    installation_number: string;
    customer_name: string;
    account_number?: string;
    contact_number: string;
    email?: string;
    address: string;
    scheduled_date: string;
    technician: string;
    assigned_technician_id?: number;
    equipment?: string;
    status: 'Pending' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
    priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    installation_type?: string;
    notes?: string;
    timeline?: TimelineEntry[];
}

// ─── Badge helpers ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    Pending:       'bg-amber-100 text-amber-800',
    Scheduled:     'bg-blue-100 text-blue-800',
    'In Progress': 'bg-indigo-100 text-indigo-800',
    Completed:     'bg-green-100 text-green-800',
    Cancelled:     'bg-red-100 text-red-800',
};

const PRIORITY_STYLES: Record<string, string> = {
    Low:    'bg-green-100 text-green-800',
    Medium: 'bg-amber-100 text-amber-800',
    High:   'bg-red-100 text-red-800',
    Urgent: 'bg-red-200 text-red-900',
};

function Badge({ label, styleMap }: { label: string; styleMap: Record<string, string> }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styleMap[label] ?? 'bg-slate-100 text-slate-700'}`}>
            {label}
        </span>
    );
}

// ─── Field components ──────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500 font-medium">{label}</label>
            {children}
        </div>
    );
}

const inputCls = 'mt-0.5 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900';
const selectCls = inputCls;

// ─── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{title}</p>
            {children}
        </div>
    );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' }) {
    const initials = name
        ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';
    const dim = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
    return (
        <div className={`${dim} rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold flex-shrink-0 ${!name ? 'border border-dashed border-slate-300 bg-slate-50 text-slate-400' : ''}`}>
            {initials}
        </div>
    );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all
            ${type === 'success' ? 'bg-indigo-700 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message}
        </div>
    );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function Timeline({ entries }: { entries?: TimelineEntry[] }) {
    const items = entries ?? [
        { id: 1, action: 'Installation created', actor: 'Admin', created_at: new Date().toISOString() },
    ];
    return (
        <SectionCard title="Activity log">
            <div className="space-y-0">
                {items.map((item, idx) => (
                    <div key={item.id} className="flex gap-3 pb-5 relative">
                        {idx < items.length - 1 && (
                            <div className="absolute left-3.5 top-7 w-px h-full bg-slate-200" />
                        )}
                        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-slate-200 flex items-center justify-center flex-shrink-0 z-10">
                            <Clock size={12} className="text-indigo-500" />
                        </div>
                        <div className="pt-0.5">
                            <p className="text-sm font-medium text-slate-800">{item.action}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {new Date(item.created_at).toLocaleString()} · {item.actor}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
    installation: Installation;
    technicians: Technician[];
}

type Tab = 'details' | 'technician' | 'timeline';

export default function InstallationDetail({ installation, technicians }: Props) {

    const [activeTab, setActiveTab] = useState<Tab>('details');
    const [saving, setSaving] = useState(false);
    const [savingTech, setSavingTech] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Form state
    const [form, setForm] = useState({
        customer_name:    installation.customer_name,
        account_number:   installation.account_number ?? '',
        contact_number:   installation.contact_number,
        email:            installation.email ?? '',
        address:          installation.address,
        scheduled_date:   installation.scheduled_date?.slice(0, 16) ?? '',
        equipment:        installation.equipment ?? '',
        status:           installation.status,
        priority:         installation.priority ?? 'Medium',
        installation_type: installation.installation_type ?? 'New Installation',
        notes:            installation.notes ?? '',
    });

    // Technician state
    const [selectedTechId, setSelectedTechId] = useState<number | ''>(
        installation.assigned_technician_id ?? ''
    );
    const [reassignNote, setReassignNote] = useState('');

    const selectedTech = technicians.find(t => t.id === selectedTechId);

    // ── Helpers ────────────────────────────────────────────────────────────────

    function showToast(message: string, type: 'success' | 'error' = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    function set(key: keyof typeof form) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm(prev => ({ ...prev, [key]: e.target.value }));
    }

    // ── Save all details ───────────────────────────────────────────────────────

    async function handleSave() {
        setSaving(true);
        router.put(`/customers/installations/${installation.id}`, form, {
            onSuccess: () => showToast('Installation updated successfully'),
            onError: (errors) => showToast(Object.values(errors)[0] as string ?? 'Failed to update', 'error'),
            onFinish: () => setSaving(false),
        });
    }

    async function handleSaveTech() {
        setSavingTech(true);
        router.put(`/customers/installations/${installation.id}`, {
            assigned_technician_id: selectedTechId || null,
            technician: selectedTech?.name ?? '',
            reassign_note: reassignNote,
        }, {
            onSuccess: () => {
                showToast(selectedTech ? `Reassigned to ${selectedTech.name}` : 'Technician cleared');
                setReassignNote('');
            },
            onError: (errors) => showToast(Object.values(errors)[0] as string ?? 'Failed to reassign', 'error'),
            onFinish: () => setSavingTech(false),
        });
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    function handleDelete() {
        if (!confirm(`Delete installation ${installation.installation_number}? This cannot be undone.`)) return;
        router.delete(`/customers/installations/delete/${installation.id}`, {
            onSuccess: () => router.visit('/customers/installations'),
            onError: () => showToast('Failed to delete installation', 'error'),
        });
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    const tabs: { key: Tab; label: string }[] = [
        { key: 'details',    label: 'Details' },
        { key: 'technician', label: 'Technician' },
        { key: 'timeline',   label: 'Timeline' },
    ];

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => router.visit('/customers/installations')}
                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-2"
                    >
                        <ChevronLeft size={14} /> Installations
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-slate-900">{installation.installation_number}</h1>
                        <Badge label={form.status} styleMap={STATUS_STYLES} />
                        {form.priority && <Badge label={form.priority} styleMap={PRIORITY_STYLES} />}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100">
                        <Trash2 size={14} /> Delete
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save changes
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-slate-200 mb-5">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
                            activeTab === t.key
                                ? 'border-indigo-600 text-indigo-700 font-medium'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Details tab ──────────────────────────────────────────────────── */}
            {activeTab === 'details' && (
                <>
                    <SectionCard title="Customer information">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Field label="Customer name">
                                <input className={inputCls} value={form.customer_name} onChange={set('customer_name')} />
                            </Field>
                            <Field label="Contact number">
                                <input className={inputCls} value={form.contact_number} onChange={set('contact_number')} />
                            </Field>
                        </div>
                        <Field label="Installation address">
                            <input className={inputCls} value={form.address} onChange={set('address')} />
                        </Field>
                    </SectionCard>

                    <SectionCard title="Installation details">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Field label="Status">
                                <select className={selectCls} value={form.status} onChange={set('status')}>
                                    {['Pending','Scheduled','In Progress','Completed','Cancelled'].map(s => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Priority">
                                <select className={selectCls} value={form.priority} onChange={set('priority')}>
                                    {['Low','Medium','High','Urgent'].map(p => (
                                        <option key={p}>{p}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Field label="Installation type">
                                <select className={selectCls} value={form.installation_type} onChange={set('installation_type')}>
                                    {['New Installation','Relocation','Upgrade','Downgrade'].map(t => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Scheduled date">
                                <input className={inputCls} type="datetime-local" value={form.scheduled_date} onChange={set('scheduled_date')} />
                            </Field>
                        </div>
                        <Field label="Required equipment">
                            <input className={inputCls} value={form.equipment} onChange={set('equipment')} placeholder="e.g. Router Model X, 100m Fiber Cable" />
                        </Field>
                    </SectionCard>

                    <SectionCard title="Notes">
                        <textarea
                            className={`${inputCls} min-h-[96px] resize-y`}
                            value={form.notes}
                            onChange={set('notes')}
                            placeholder="Add installation notes..."
                        />
                    </SectionCard>
                </>
            )}

            {/* ── Technician tab ────────────────────────────────────────────────── */}
            {activeTab === 'technician' && (
                <>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Assigned technician</p>

                        {/* Current tech preview */}
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200 mb-5">
                            <Avatar name={selectedTech?.name} />
                            <div>
                                <p className="text-sm font-semibold text-slate-800">
                                    {selectedTech?.name ?? 'Unassigned'}
                                </p>
                                <p className="text-xs text-slate-400">Field Technician</p>
                            </div>
                            {selectedTech && (
                                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">Active</span>
                            )}
                        </div>

                        {/* Reassign select */}
                        <Field label="Reassign technician">
                            <select
                                className={selectCls}
                                value={selectedTechId}
                                onChange={e => setSelectedTechId(e.target.value ? Number(e.target.value) : '')}
                            >
                                <option value="">— Unassigned —</option>
                                {technicians.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </Field>

                        {/* Reassignment note */}
                        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4">
                            <p className="text-xs text-slate-500 mb-2">Reassignment note (optional)</p>
                            <textarea
                                className={`${inputCls} min-h-[64px] resize-none`}
                                value={reassignNote}
                                onChange={e => setReassignNote(e.target.value)}
                                placeholder="Reason for reassignment..."
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => { setSelectedTechId(''); setReassignNote(''); }}
                                className="px-3 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            >
                                Clear assignment
                            </button>
                            <button
                                onClick={handleSaveTech}
                                disabled={savingTech}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
                                {savingTech ? <Loader2 size={14} className="animate-spin" /> : <User size={14} />}
                                Confirm reassignment
                            </button>
                        </div>
                    </div>

                    {/* Scheduled slot */}
                    <SectionCard title="Scheduled slot">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Date & time">
                                <input className={inputCls} type="datetime-local" value={form.scheduled_date} onChange={set('scheduled_date')} />
                            </Field>
                            <Field label="Status">
                                <select className={selectCls} value={form.status} onChange={set('status')}>
                                    {['Pending','Scheduled','In Progress','Completed','Cancelled'].map(s => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                    </SectionCard>
                </>
            )}

            {/* ── Timeline tab ──────────────────────────────────────────────────── */}
            {activeTab === 'timeline' && (
                <Timeline entries={installation.timeline} />
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
