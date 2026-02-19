import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import {
  LayoutDashboard, Users, Ticket, MessageSquare, Wifi, BarChart3,
  Settings, Bell, Search, ChevronDown, ChevronRight, AlertCircle,
  Clock, CheckCircle, TrendingUp, Activity, Hexagon, ArrowUpRight,
  ArrowDownRight, ArrowRight, ShieldAlert, UserCheck, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

// ── Types (matching DashboardController output) ──────────────────────────────

interface Kpis {
  total_tickets:      number;
  ticket_change:      number;
  ticket_positive:    boolean;
  open_issues:        number;
  open_change:        number;
  open_positive:      boolean;
  resolution_rate:    number;
  avg_response_hours: number;
  total_customers:    number;
  active_customers:   number;
}

interface ChartPoint {
  name:    string;
  date:    string;
  tickets: number;
  revenue: number;
}

interface RecentTicket {
  id:            number;
  ticket_number: string;
  subject:       string;
  customer:      string;
  status:        string;
  priority:      string;
  category:      string;
  created_at:    string;
  time_elapsed:  string;
  is_overdue:    boolean;
}

interface ByCategory {
  category: string;
  count:    number;
}

interface AgentPerf {
  name:            string;
  total_assigned:  number;
  total_resolved:  number;
  resolution_rate: number;
}

interface SlaBreaches {
  Critical: number;
  High:     number;
  Medium:   number;
  Low:      number;
}

interface PageProps {
  kpis:              Kpis;
  chart_data:        ChartPoint[];
  recent_tickets:    RecentTicket[];
  by_priority:       Record<string, number>;
  by_status:         Record<string, number>;
  by_category:       ByCategory[];
  agent_performance: AgentPerf[];
  sla_breaches:      SlaBreaches;
  [key: string]: unknown;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const priorityColors: Record<string, string> = {
  CRITICAL: 'text-red-600 bg-red-50 border border-red-200',
  HIGH:     'text-orange-600 bg-orange-50 border border-orange-200',
  MEDIUM:   'text-blue-600 bg-blue-50 border border-blue-200',
  LOW:      'text-slate-600 bg-slate-100 border border-slate-200',
};

const statusColors: Record<string, string> = {
  'Open':        'text-yellow-700 bg-yellow-50 border border-yellow-200',
  'In Progress': 'text-blue-700 bg-blue-50 border border-blue-200',
  'Resolved':    'text-green-700 bg-green-50 border border-green-200',
  'Closed':      'text-slate-600 bg-slate-100 border border-slate-200',
  'On Hold':     'text-purple-700 bg-purple-50 border border-purple-200',
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6'];

const fmt = (n: number) => n.toLocaleString();

// ── Sidebar ───────────────────────────────────────────────────────────────────

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    id: 'customers', label: 'Customers', icon: Users, path: '/customers',
    subItems: [
      { id: 'customer-list',  label: 'Customer List',  path: '/customers/list' },
      { id: 'installations',  label: 'Installations',  path: '/customers/installations' },
      { id: 'leads',          label: 'Leads',          path: '/customers/leads' },
    ],
  },
  {
    id: 'support', label: 'Customer Support', icon: MessageSquare, path: '/support',
    subItems: [
      { id: 'tickets', label: 'Tickets', path: '/support/tickets' },
    ],
  },
  {
    id: 'network', label: 'Network', icon: Wifi, path: '/network',
    subItems: [
      { id: 'routers',    label: 'Routers',    path: '/network/routers' },
      { id: 'services',   label: 'Services',   path: '/network/services' },
      { id: 'monitoring', label: 'Monitoring', path: '/network/monitoring' },
    ],
  },
  {
    id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/analytics',
    subItems: [
      { id: 'sla-reports',       label: 'SLA Reports',       path: '/dashboard/sla' },
      { id: 'performance',       label: 'Performance',       path: '/dashboard/performance' },
      { id: 'customer-insights', label: 'Customer Insights', path: '/dashboard/insights' },
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: Settings, path: '/settings',
    subItems: [
      { id: 'users',      label: 'Users & Roles',     path: '/settings/users' },
      { id: 'notifs',     label: 'Notifications',     path: '/settings/notifications' },
      { id: 'sla-config', label: 'SLA Configuration', path: '/settings/sla' },
      { id: 'system',     label: 'System Settings',   path: '/settings/system' },
    ],
  },
];

function Sidebar() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ support: true });
  const currentPath = window.location.pathname;

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const renderItem = (item: typeof menuItems[0], depth = 0) => {
    const hasChildren = 'subItems' in item && (item as any).subItems?.length > 0;
    const isOpen      = expanded[item.id];
    const isActive    = currentPath === item.path;
    const Icon        = item.icon;
    const pl          = depth === 0 ? '' : 'pl-10';

    return (
      <div key={item.id}>
        <div
          onClick={() => hasChildren ? toggle(item.id) : router.visit(item.path)}
          className={`flex items-center w-full px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer transition-all duration-150 ${pl}
            ${isActive && !hasChildren
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          <div className="flex items-center flex-1 gap-3">
            {Icon && <Icon size={18} className={isActive && !hasChildren ? 'text-white' : 'text-slate-400'} />}
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          {hasChildren && (
            <span className="text-slate-500">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="ml-3 border-l border-slate-700/50 pl-2">
            {(item as any).subItems.map((sub: any) => renderItem(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col border-r border-slate-800 shrink-0">
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <Hexagon className="text-white fill-current" size={22} />
        </div>
        <span className="text-white text-lg font-bold tracking-tight">Cable One</span>
      </div>

      <nav className="flex-1 px-3 py-5 overflow-y-auto space-y-0.5">
        {menuItems.map(item => renderItem(item))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Admin User</p>
            <p className="text-xs text-slate-400">System Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Create Ticket Modal ───────────────────────────────────────────────────────

function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    customer_name: '', account_number: '', phone: '', email: '',
    subject: '', ticket_type: 'Technical Issue', escalation_level: 'Level 1',
    priority: 'Medium', category: 'Connectivity', description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    setSubmitting(true);
    router.post('/support/tickets', form, {
      onError: (e) => { setErrors(e); setSubmitting(false); },
      onSuccess: () => onClose(),
    });
  };

  const field = (label: string, key: string, type = 'text', required = false) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  const select = (label: string, key: string, options: string[], required = false) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={(form as any)[key]}
        onChange={e => set(key, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-5 border-b border-slate-100 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">New Support Ticket</h2>
            <p className="text-sm text-slate-500 mt-0.5">Fill in all required fields to open a ticket</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer info */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">1</span>
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {field('Customer Name',   'customer_name',   'text', true)}
              {field('Account Number',  'account_number')}
              {field('Phone Number',    'phone',           'tel',  true)}
              {field('Email Address',   'email',           'email')}
            </div>
          </div>

          {/* Ticket details */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold">2</span>
              Ticket Details
            </h3>
            <div className="space-y-4">
              {field('Subject', 'subject', 'text', true)}
              <div className="grid grid-cols-3 gap-4">
                {select('Ticket Type', 'ticket_type', ['Technical Issue', 'Support Request', 'Service Request', 'Escalation', 'General Inquiry'], true)}
                {select('Priority',    'priority',    ['Low', 'Medium', 'High', 'Critical'], true)}
                {select('Escalation',  'escalation_level', ['Level 1', 'Level 2', 'Level 3'], true)}
              </div>
              {select('Category', 'category', ['Connectivity', 'Performance', 'Billing', 'Equipment', 'Service Request', 'Installation', 'Technical'], true)}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none
                    ${errors.description ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                  placeholder="Describe the issue in detail..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-100 rounded-b-2xl flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition-colors">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? <RefreshCw size={15} className="animate-spin" /> : <Ticket size={15} />}
            {submitting ? 'Creating…' : 'Create Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    kpis, chart_data, recent_tickets, by_priority,
    by_status, by_category, agent_performance, sla_breaches,
  } = usePage<PageProps>().props;

  const [search, setSearch]               = useState('');
  const [showCreateTicket, setShowCreate] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim()) {
      router.visit(`/support/tickets?search=${encodeURIComponent(search)}`);
    }
  };

  // Pie chart data from by_status
  const statusPieData = Object.entries(by_status).map(([name, value]) => ({ name, value }));
  const totalSlaBreaches = Object.values(sla_breaches).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Search tickets, customers…"
                  className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm shadow-indigo-500/30"
              >
                <Ticket size={16} /> Create Ticket
              </button>
            </div>
          </div>
        </header>

        {/* ── Scrollable Content ── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── SLA Breach Alert Banner ── */}
          {totalSlaBreaches > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
              <ShieldAlert className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-700 font-medium">
                <span className="font-bold">{totalSlaBreaches} SLA breach{totalSlaBreaches > 1 ? 'es' : ''}</span> detected —&nbsp;
                {sla_breaches.Critical > 0 && <span className="font-bold">{sla_breaches.Critical} Critical, </span>}
                {sla_breaches.High > 0 && <span>{sla_breaches.High} High, </span>}
                {sla_breaches.Medium > 0 && <span>{sla_breaches.Medium} Medium, </span>}
                {sla_breaches.Low > 0 && <span>{sla_breaches.Low} Low</span>}
              </p>
              <Link href="/dashboard/sla" className="ml-auto text-xs font-semibold text-red-600 hover:underline shrink-0">
                View SLA Report →
              </Link>
            </div>
          )}

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tickets */}
            <KpiCard
              title="Total Tickets"
              value={fmt(kpis.total_tickets)}
              badge={`${kpis.ticket_positive ? '+' : ''}${kpis.ticket_change}% this week`}
              badgePositive={kpis.ticket_positive}
              icon={Ticket}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            {/* Open Issues */}
            <KpiCard
              title="Open Issues"
              value={fmt(kpis.open_issues)}
              badge="Requires Attention"
              badgePositive={kpis.open_positive}
              icon={AlertCircle}
              iconBg="bg-orange-50"
              iconColor="text-orange-500"
            />
            {/* Resolution Rate */}
            <KpiCard
              title="Resolution Rate"
              value={`${kpis.resolution_rate}%`}
              badge={kpis.resolution_rate >= 80 ? 'Above Target' : 'Below Target'}
              badgePositive={kpis.resolution_rate >= 80}
              icon={CheckCircle}
              iconBg="bg-green-50"
              iconColor="text-green-600"
            />
            {/* Avg Response */}
            <KpiCard
              title="Avg Response"
              value={`${kpis.avg_response_hours}h`}
              badge="Maintained"
              badgePositive
              icon={Clock}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
          </div>

          {/* Second row KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total Customers"
              value={fmt(kpis.total_customers)}
              badge="Registered"
              badgePositive
              icon={Users}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
            <KpiCard
              title="Active Customers"
              value={fmt(kpis.active_customers)}
              badge={`${Math.round((kpis.active_customers / (kpis.total_customers || 1)) * 100)}% of total`}
              badgePositive
              icon={UserCheck}
              iconBg="bg-teal-50"
              iconColor="text-teal-600"
            />
            <KpiCard
              title="SLA Breaches"
              value={fmt(totalSlaBreaches)}
              badge={totalSlaBreaches === 0 ? 'All clear' : 'Needs action'}
              badgePositive={totalSlaBreaches === 0}
              icon={ShieldAlert}
              iconBg="bg-red-50"
              iconColor="text-red-500"
            />
            <KpiCard
              title="Critical Tickets"
              value={fmt(by_priority['Critical'] ?? 0)}
              badge="Highest priority"
              badgePositive={(by_priority['Critical'] ?? 0) === 0}
              icon={Activity}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
            />
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue area chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800">Revenue Analytics</h2>
                <span className="text-xs text-slate-400">Last 7 days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart_data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 13 }}
                      itemStyle={{ color: '#c7d2fe' }}
                      formatter={(v: number) => [`KES ${v.toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5}
                      fillOpacity={1} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ticket volume bar chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-800">Ticket Volume</h2>
                <span className="text-xs text-slate-400">Last 7 days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart_data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff', fontSize: 13 }}
                      formatter={(v: number) => [v, 'Tickets']}
                    />
                    <Bar dataKey="tickets" fill="#6366f1" radius={[5, 5, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ── Breakdowns Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Status Pie */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Tickets by Status</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value">
                      {statusPieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [v, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {statusPieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-600">{entry.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">By Category</h2>
              <div className="space-y-3">
                {by_category.map((c, i) => {
                  const max = by_category[0]?.count || 1;
                  const pct = Math.round((c.count / max) * 100);
                  return (
                    <div key={c.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 capitalize">{c.category}</span>
                        <span className="font-semibold text-slate-800">{c.count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Performance */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-4">Agent Performance</h2>
              <div className="space-y-3">
                {agent_performance.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                      {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700 truncate">{agent.name}</span>
                        <span className={`font-semibold text-xs ${agent.resolution_rate >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                          {agent.resolution_rate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${agent.resolution_rate >= 70 ? 'bg-green-500' : 'bg-orange-400'}`}
                          style={{ width: `${agent.resolution_rate}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{agent.total_assigned} assigned · {agent.total_resolved} resolved</p>
                    </div>
                  </div>
                ))}
                {agent_performance.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">No agent data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Recent Tickets Table ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Recent Support Tickets</h2>
              <Link href="/support/tickets" className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket #</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent_tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      onClick={() => router.visit(`/support/tickets/${ticket.ticket_number}`)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${ticket.is_overdue ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-mono font-semibold text-indigo-600">{ticket.ticket_number}</span>
                      </td>
                      <td className="px-6 py-3.5 max-w-xs">
                        <p className="text-sm font-medium text-slate-800 truncate">{ticket.subject}</p>
                        <p className="text-xs text-slate-400 capitalize">{ticket.category}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-slate-700">{ticket.customer}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusColors[ticket.status] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${priorityColors[ticket.priority] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`text-xs ${ticket.is_overdue ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
                          {ticket.is_overdue && '⚠ '}{ticket.time_elapsed}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {recent_tickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                        No tickets yet. Create your first ticket to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {showCreateTicket && <CreateTicketModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ── KPI Card Component ────────────────────────────────────────────────────────

interface KpiCardProps {
  title:         string;
  value:         string;
  badge:         string;
  badgePositive: boolean;
  icon:          React.ComponentType<{ size?: number; className?: string }>;
  iconBg:        string;
  iconColor:     string;
}

function KpiCard({ title, value, badge, badgePositive, icon: Icon, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      </div>
      <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
        ${badgePositive ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50'}`}
      >
        {badgePositive
          ? <TrendingUp size={11} />
          : <Activity size={11} />}
        {badge}
      </div>
    </div>
  );
}
