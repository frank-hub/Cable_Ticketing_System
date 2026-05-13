import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard, Ticket, Users, Wifi,
    Siren, UserCog, LayoutGrid, X
} from 'lucide-react';

interface AuthCan {
    'view-tickets'?:   boolean;
    'view-customers'?: boolean;
    'view-users'?:     boolean;
    'view-settings'?:  boolean;
    [key: string]:     boolean | undefined;
}

interface PageProps {
    auth: {
        user: { role: string };
        can: AuthCan;
    };
    [key: string]: unknown;
}

const NAV_ITEMS = [
    {
        label:       'Dashboard',
        description: 'Overview',
        href:        '/dashboard',
        icon:        LayoutDashboard,
        bg:          'bg-blue-50',
        iconColor:   'text-blue-700',
        permission:  null,          // everyone
    },
    {
        label:       'Tickets',
        description: 'Support queue',
        href:        '/support/tickets',
        icon:        Ticket,
        bg:          'bg-green-50',
        iconColor:   'text-green-700',
        permission:  null,
    },
    {
        label:       'Customers',
        description: 'Manage accounts',
        href:        '/customers/list',
        icon:        Users,
        bg:          'bg-indigo-50',
        iconColor:   'text-indigo-700',
        permission:  null,
    },
    {
        label:       'Packages',
        description: 'Internet plans',
        href:        '/packages',
        icon:        Wifi,
        bg:          'bg-amber-50',
        iconColor:   'text-amber-700',
        permission:  null,
    },
    {
        label:       'SOS Alert',
        description: 'Emergency only',
        href:        '/sos',
        icon:        Siren,
        bg:          'bg-red-50',
        iconColor:   'text-red-700',
        permission:  null,
        danger:      true,
    },
    {
        label:       'Users',
        description: 'Manage team',
        href:        '/settings/users',
        icon:        UserCog,
        bg:          'bg-slate-100',
        iconColor:   'text-slate-600',
        permission:  null,
    },
];

export default function QuickNav() {
    const { auth } = usePage<PageProps>().props;
    const can      = auth?.can ?? {};

    const [open, setOpen] = useState(false);

    // Close on Escape, open on G key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
            if (e.key === 'g' && !['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement).tagName)) {
                setOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const navigate = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    // Filter items based on permissions
    const visibleItems = NAV_ITEMS.filter(item => {
        if (!item.permission) return true;
        return can[item.permission] === true;
    });

    return (
        <>
            {/* ── Floating trigger button ───────────────────── */}
            <button
                onClick={() => setOpen(true)}
                aria-label="Open quick navigation"
                className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:shadow-xl"
            >
                <LayoutGrid className="w-4 h-4" />
                Quick nav
            </button>

            {/* ── Backdrop ──────────────────────────────────── */}
            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    {/* ── Modal ─────────────────────────────── */}
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Quick navigation</p>
                                <p className="text-xs text-slate-500 mt-0.5">Jump to any section</p>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Links grid */}
                        <div className="p-3 grid grid-cols-2 gap-2">
                            {visibleItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => navigate(item.href)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:shadow-sm ${
                                            item.danger
                                                ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                                : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                                            <Icon className={`w-4 h-4 ${item.iconColor}`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`text-xs font-semibold truncate ${item.danger ? 'text-red-800' : 'text-slate-800'}`}>
                                                {item.label}
                                            </p>
                                            <p className={`text-[11px] truncate ${item.danger ? 'text-red-600' : 'text-slate-500'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-3 pt-1 flex items-center justify-between border-t border-slate-100">
                            <p className="text-[11px] text-slate-400">
                                Press <kbd className="px-1.5 py-0.5 text-[10px] rounded border border-slate-200 bg-slate-50 font-mono">G</kbd> to toggle
                            </p>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
