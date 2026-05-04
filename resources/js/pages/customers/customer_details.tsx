import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    User, Phone, Mail, MapPin, Package, Calendar,
    ChevronLeft, Trash2, Save, Loader2, CheckCircle,
    AlertCircle, Clock, XCircle, Ticket, Activity,
    ToggleLeft, ToggleRight, Hash
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketItem {
    id: number;
    ticket_number: string;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
}

interface Customer {
    id: number;
    customer_name: string;
    account_number: string;
    primary_phone: string;
    email_address?: string;
    physical_address?: string;
    service_package: string;
    status: 'Active' | 'Suspended' | 'Inactive';
    installation_date?: string;
    tickets?: TicketItem[];
}
interface InternetPackage {
    id: number;
    name: string;
    speed: string;
    price: number;
    is_active: boolean;
}

interface Props {
    customer: Customer;
    internetPackages: InternetPackage[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    Active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    Suspended: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
    Inactive:  { bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
};

const TICKET_STATUS_COLOR: Record<string, string> = {
    Open:        'bg-blue-50 text-blue-700',
    'In Progress':'bg-indigo-50 text-indigo-700',
    Resolved:    'bg-emerald-50 text-emerald-700',
    Closed:      'bg-slate-100 text-slate-600',
};

const PRIORITY_COLOR: Record<string, string> = {
    Low:    'bg-slate-100 text-slate-600',
    Medium: 'bg-amber-50 text-amber-700',
    High:   'bg-red-50 text-red-700',
    Urgent: 'bg-red-100 text-red-800',
};

function StatusBadge({ status }: { status: Customer['status'] }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Inactive;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
            {message}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    );
}

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 bg-white transition-all placeholder:text-slate-300';
const selectCls = inputCls;

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <span className="text-slate-400">{icon}</span>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Initials Avatar ──────────────────────────────────────────────────────────

function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const dim = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-8 h-8 text-xs';
    return (
        <div className={`${dim} rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0`}>
            {initials}
        </div>
    );
}

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Tab = 'details' | 'tickets';

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CustomerDetail({ customer, internetPackages }: Props) {
    const [activeTab, setActiveTab] = useState<Tab>('details');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [form, setForm] = useState({
        customer_name:    customer.customer_name,
        account_number:   customer.account_number,
        primary_phone:    customer.primary_phone,
        email_address:    customer.email_address ?? '',
        physical_address: customer.physical_address ?? '',
        service_package:  customer.service_package,
        status:           customer.status,
        installation_date: customer.installation_date?.slice(0, 10) ?? '',
    });

    function showToast(message: string, type: 'success' | 'error' = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    function set(key: keyof typeof form) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
            setForm(prev => ({ ...prev, [key]: e.target.value }));
    }

    function handleSave() {
        setSaving(true);
        router.put(`/customers/update/${customer.id}`, form, {
            onSuccess: () => showToast('Customer updated successfully'),
            onError: (errors) => showToast(Object.values(errors)[0] as string ?? 'Failed to update', 'error'),
            onFinish: () => setSaving(false),
        });
    }

    function handleDelete() {
        alert('This will permanently delete the customer and all associated tickets. This action cannot be undone.');

        if (!confirm(`Delete customer ${customer.account_number}? This cannot be undone.`)) return;
        router.delete(`/customers/delete/${customer.id}`, {
            onSuccess: () => router.visit('/customers'),
            onError: () => showToast('Failed to delete customer', 'error'),
        });
    }

    function handleStatusToggle(newStatus: Customer['status']) {
        router.put(`/customers/${customer.id}`, { ...form, status: newStatus }, {
            onSuccess: () => {
                setForm(prev => ({ ...prev, status: newStatus }));
                showToast(`Customer ${newStatus.toLowerCase()}`);
            },
            onError: () => showToast('Failed to update status', 'error'),
        });
    }

    const tabs: { key: Tab; label: string; count?: number }[] = [
        { key: 'details', label: 'Details' },
        { key: 'tickets', label: 'Tickets', count: customer.tickets?.length ?? 0 },
    ];

    return (
        <div className="min-h-screen bg-slate-50/70">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* Back */}
                <button
                    onClick={() => router.visit('/customers/list')}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors font-medium"
                >
                    <ChevronLeft size={15} /> All Customers
                </button>

                {/* Hero Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Avatar name={customer.customer_name} />
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{form.customer_name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                                        {form.account_number}
                                    </span>
                                    <StatusBadge status={form.status} />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {form.status !== 'Active' && (
                                <button
                                    onClick={() => handleStatusToggle('Active')}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-medium transition-colors"
                                >
                                    <ToggleRight size={13} /> Activate
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-medium transition-colors"
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-60 font-medium transition-colors"
                            >
                                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                                Save changes
                            </button>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
                        <div className="text-center">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Package</p>
                            <p className="text-sm font-semibold text-slate-700">{form.service_package || '—'}</p>
                        </div>
                        <div className="text-center border-x border-slate-100">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Since</p>
                            <p className="text-sm font-semibold text-slate-700">
                                {form.installation_date ? new Date(form.installation_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Tickets</p>
                            <p className="text-sm font-semibold text-slate-700">{customer.tickets?.length ?? 0}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                                activeTab === t.key
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {t.label}
                            {t.count !== undefined && t.count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                    activeTab === t.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                }`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Details Tab ──────────────────────────────────────────── */}
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <SectionCard title="Contact information" icon={<User size={14} />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Full name">
                                    <input className={inputCls} value={form.customer_name} onChange={set('customer_name')} placeholder="Customer name" />
                                </Field>
                                <Field label="Account number">
                                    <input className={inputCls} value={form.account_number} onChange={set('account_number')} placeholder="ACC-0001" />
                                </Field>
                                <Field label="Primary phone">
                                    <input className={inputCls} value={form.primary_phone} onChange={set('primary_phone')} placeholder="+254 700 000 000" />
                                </Field>
                                <Field label="Email address">
                                    <input className={inputCls} type="email" value={form.email_address} onChange={set('email_address')} placeholder="email@example.com" />
                                </Field>
                                <div className="md:col-span-2">
                                    <Field label="Physical address">
                                        <input className={inputCls} value={form.physical_address} onChange={set('physical_address')} placeholder="Street address, area" />
                                    </Field>
                                </div>
                            </div>
                        </SectionCard>

                        <SectionCard title="Service details" icon={<Package size={14} />}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field label="Service package">
                                    <select
                                        className={selectCls}
                                        value={form.service_package}  // ← this should be "Home 1"
                                        onChange={set('service_package')}
                                    >
                                        <option value="">Select a package</option>
                                        {internetPackages.map(pkg => (
                                            <option key={pkg.id} value={pkg.name}>  {/* ← value must exactly match */}
                                                {pkg.name} - {pkg.speed} Mbps at Ksh {Number(pkg.price).toLocaleString()}/month
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Status">
                                    <select className={selectCls} value={form.status} onChange={set('status')}>
                                        <option value="">Select status</option>
                                        {['Active', 'Suspended', 'Inactive'].map(s => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Installation date">
                                    <input className={inputCls} type="date" value={form.installation_date} onChange={set('installation_date')} />
                                </Field>
                            </div>
                        </SectionCard>
                    </div>
                )}

                {/* ── Tickets Tab ──────────────────────────────────────────── */}
                {activeTab === 'tickets' && (
                    <SectionCard title="Support tickets" icon={<Activity size={14} />}>
                        {!customer.tickets || customer.tickets.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <Activity size={18} className="text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-400">No tickets yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {customer.tickets.map(ticket => (
                                    <div key={ticket.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all group cursor-pointer"
                                        onClick={() => router.visit(`/tickets/${ticket.id}`)}>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                {ticket.ticket_number}
                                            </span>
                                            <p className="text-sm font-medium text-slate-700">{ticket.subject}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[ticket.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {ticket.priority}
                                            </span>
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TICKET_STATUS_COLOR[ticket.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-xs text-slate-400 hidden group-hover:inline">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}
