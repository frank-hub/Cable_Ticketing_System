import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    Wifi, Plus, Edit2, Trash2, ArrowLeft, Home,
    CheckCircle, XCircle, Zap, Building2, HomeIcon,
    ToggleLeft, ToggleRight, Search
} from 'lucide-react';

interface Package {
    id: number;
    name: string;
    speed: number;
    speed_label: string;
    price: number;
    price_label: string;
    type: 'Home' | 'Business';
    description: string | null;
    is_active: boolean;
    created_at: string;
}

interface Stats {
    total: number;
    active: number;
    home: number;
    business: number;
}

interface PageProps {
    packages: Package[];
    stats: Stats;
    flash: { success?: string; error?: string };
    auth: { user: { role: string } };
    [key: string]: unknown;
}

const emptyForm = {
    name:        '',
    speed:       '',
    price:       '',
    type:        'Home' as 'Home' | 'Business',
    description: '',
    is_active:   true,
};

const PackagesPage = () => {
    const { packages, stats, flash, auth } = usePage<PageProps>().props;

    const canManage = ['Admin', 'Manager'].includes(auth.user.role);

    const [search, setSearch]               = useState('');
    const [filterType, setFilterType]       = useState<'all' | 'Home' | 'Business'>('all');
    const [showModal, setShowModal]         = useState(false);
    const [editingPkg, setEditingPkg]       = useState<Package | null>(null);
    const [form, setForm]                   = useState(emptyForm);
    const [processing, setProcessing]       = useState(false);

    // ── Open modals ────────────────────────────────────────────────────
    const openCreate = () => {
        setEditingPkg(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (pkg: Package) => {
        setEditingPkg(pkg);
        setForm({
            name:        pkg.name,
            speed:       String(pkg.speed),
            price:       String(pkg.price),
            type:        pkg.type,
            description: pkg.description ?? '',
            is_active:   pkg.is_active,
        });
        setShowModal(true);
    };

    // ── Submit ─────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (!form.name || !form.speed || !form.price) {
            alert('Name, speed and price are required.');
            return;
        }

        setProcessing(true);
        const payload = {
            name:        form.name,
            speed:       Number(form.speed),
            price:       Number(form.price),
            type:        form.type,
            description: form.description || null,
            is_active:   form.is_active,
        };

        if (editingPkg) {
            router.patch(`/packages/${editingPkg.id}`, payload, {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
                onFinish:  () => setProcessing(false),
            });
        } else {
            router.post('/packages', payload, {
                preserveScroll: true,
                onSuccess: () => setShowModal(false),
                onFinish:  () => setProcessing(false),
            });
        }
    };

    // ── Toggle active ──────────────────────────────────────────────────
    const handleToggle = (pkg: Package) => {
        router.patch(`/packages/${pkg.id}/toggle`, {}, { preserveScroll: true });
    };

    // ── Delete ─────────────────────────────────────────────────────────
    const handleDelete = (pkg: Package) => {
        if (!window.confirm(`Delete "${pkg.name}"? This cannot be undone.`)) return;
        router.delete(`/packages/${pkg.id}`, { preserveScroll: true });
    };

    // ── Filter ─────────────────────────────────────────────────────────
    const filtered = packages.filter(pkg => {
        const matchesSearch = pkg.name.toLowerCase().includes(search.toLowerCase()) ||
            pkg.speed_label.toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === 'all' || pkg.type === filterType;
        return matchesSearch && matchesType;
    });

    const inputClass = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all';
    const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

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
                        Back
                    </button>
                    <div className="flex items-center text-sm text-slate-400">
                        <Home className="w-4 h-4 mr-1" />
                        <span>/ Internet Packages</span>
                    </div>
                </div>

                {/* Flash */}
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
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Internet Packages</h1>
                        <p className="text-slate-500">Manage Home and Business internet plans</p>
                    </div>
                    {canManage && (
                        <button
                            onClick={openCreate}
                            className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2"
                        >
                            <Plus size={18} /> Add Package
                        </button>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total',    value: stats.total,    icon: Wifi,      bg: 'bg-slate-50',  color: 'text-slate-600'  },
                        { label: 'Active',   value: stats.active,   icon: CheckCircle, bg: 'bg-green-50', color: 'text-green-600' },
                        { label: 'Home',     value: stats.home,     icon: HomeIcon,  bg: 'bg-blue-50',   color: 'text-blue-600'   },
                        { label: 'Business', value: stats.business, icon: Building2, bg: 'bg-purple-50', color: 'text-purple-600' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${s.bg}`}>
                                <s.icon className={`w-6 h-6 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
                                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search packages..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'Home', 'Business'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    filterType === t
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {t === 'all' ? 'All' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Package Cards */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-20 text-center">
                        <Wifi className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No packages found</p>
                        <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filtered.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                                    pkg.is_active ? 'border-slate-100' : 'border-slate-200 opacity-60'
                                }`}
                            >
                                {/* Card header */}
                                <div className={`p-5 rounded-t-2xl ${
                                    pkg.type === 'Business'
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-white/80 bg-white/20 px-2.5 py-1 rounded-full">
                                            {pkg.type === 'Business'
                                                ? <><Building2 className="w-3 h-3" /> Business</>
                                                : <><HomeIcon className="w-3 h-3" /> Home</>
                                            }
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                            pkg.is_active ? 'bg-green-400/30 text-green-100' : 'bg-white/20 text-white/60'
                                        }`}>
                                            {pkg.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                                    {pkg.description && (
                                        <p className="text-white/70 text-xs mt-1">{pkg.description}</p>
                                    )}
                                </div>

                                {/* Card body */}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-50 rounded-lg">
                                                <Zap className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Speed</p>
                                                <p className="text-lg font-bold text-slate-900">{pkg.speed_label}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Monthly</p>
                                            <p className="text-lg font-bold text-slate-900">{pkg.price_label}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {canManage && (
                                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                            {/* Toggle */}
                                            <button
                                                onClick={() => handleToggle(pkg)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                    pkg.is_active
                                                        ? 'text-orange-600 hover:bg-orange-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                }`}
                                                title={pkg.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {pkg.is_active
                                                    ? <><ToggleRight className="w-4 h-4" /> Deactivate</>
                                                    : <><ToggleLeft className="w-4 h-4" /> Activate</>
                                                }
                                            </button>

                                            <div className="flex items-center gap-1 ml-auto">
                                                <button
                                                    onClick={() => openEdit(pkg)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(pkg)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Create / Edit Modal ───────────────────────────────────────── */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingPkg ? 'Edit Package' : 'New Package'}
                                </h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {editingPkg ? `Editing: ${editingPkg.name}` : 'Add a new internet plan'}
                                </p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className={labelClass}>Package Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={inputClass}
                                    placeholder="e.g. Home Starter, Business Pro"
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className={labelClass}>Type <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['Home', 'Business'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setForm({ ...form, type: t })}
                                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                                                form.type === t
                                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                                    : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                                            }`}
                                        >
                                            {t === 'Home' ? <HomeIcon className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Speed + Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Speed (Mbps) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={form.speed}
                                        onChange={(e) => setForm({ ...form, speed: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 20"
                                        min={1}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Price (KES) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 2500"
                                        min={0}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className={labelClass}>Description <span className="text-slate-400 font-normal">(optional)</span></label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className={inputClass}
                                    placeholder="e.g. Perfect for light browsing and streaming"
                                    maxLength={500}
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Active</p>
                                    <p className="text-xs text-slate-500">Inactive packages are hidden from customers</p>
                                </div>
                                <button
                                    onClick={() => setForm({ ...form, is_active: !form.is_active })}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${
                                        form.is_active ? 'bg-indigo-600' : 'bg-slate-300'
                                    }`}
                                >
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                        form.is_active ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={processing}
                                className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {editingPkg ? <><Edit2 className="w-4 h-4" /> Save Changes</> : <><Plus className="w-4 h-4" /> Create Package</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackagesPage;
